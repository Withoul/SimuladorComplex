import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Rounded } from '../theme';
import QUESTIONS from '../data/questions';
import { getQuestionHistory } from '../services/storage';

export default function TemarioTabScreen() {
  const [showOnlyCorrect, setShowOnlyCorrect] = useState(false);
  const [historyMap, setHistoryMap] = useState({});

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        const history = await getQuestionHistory();
        setHistoryMap(history);
      };
      loadHistory();
    }, [])
  );

  const renderItem = ({ item, index }) => {
    const attempts = historyMap[item.id] || [];
    const correctCount = attempts.filter(x => x === true).length;
    const accuracy = attempts.length > 0 ? (correctCount / attempts.length) * 100 : 0;

    // Dynamically calculate progress bar color
    // closer to 100% -> Green, closer to 0% -> Red
    let barColor = Colors.error;
    if (accuracy >= 80) {
      barColor = Colors.success;
    } else if (accuracy >= 50) {
      barColor = Colors.secondary; // yellow/orange
    }

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.questionNumber}>Pregunta {index + 1}</Text>
          
          {attempts.length > 0 && (
            <View style={styles.progressBadge}>
              <Text style={[styles.progressTextBadge, { color: barColor }]}>
                {accuracy.toFixed(0)}% Éxito
              </Text>
              <View style={styles.progressBarWrapper}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${accuracy}%`, backgroundColor: barColor }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>
        <Text style={styles.questionText}>{item.enunciado}</Text>
        
        <View style={styles.optionsContainer}>
          {item.opciones.map((option, optIdx) => {
            const isCorrect = option === item.respuestaCorrecta;
            if (showOnlyCorrect && !isCorrect) return null;
            
            return (
              <View 
                key={optIdx} 
                style={[
                  styles.optionRow, 
                  isCorrect && styles.optionRowCorrect,
                  !isCorrect && showOnlyCorrect === false && styles.optionRowNeutral
                ]}
              >
                <Ionicons 
                  name={isCorrect ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={isCorrect ? Colors.success : Colors.outlineVariant} 
                />
                <Text 
                  style={[
                    styles.optionText, 
                    isCorrect && styles.optionTextCorrect
                  ]}
                >
                  {option}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Temario de Estudio</Text>
        <Text style={styles.headerSubtitle}>{QUESTIONS.length} preguntas disponibles</Text>
      </View>
      
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Mostrar solo respuestas correctas</Text>
        <Switch
          value={showOnlyCorrect}
          onValueChange={setShowOnlyCorrect}
          trackColor={{ false: Colors.surfaceDim, true: Colors.successLight }}
          thumbColor={showOnlyCorrect ? Colors.success : Colors.outline}
        />
      </View>

      <FlatList
        data={QUESTIONS}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 40,
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  toggleLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  listContent: {
    padding: Spacing.xl,
    paddingBottom: 100, // Space for bottom tabs
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    elevation: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  questionNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  progressBadge: {
    alignItems: 'flex-end',
    width: 120,
  },
  progressTextBadge: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  progressBarWrapper: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  questionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Rounded.md,
    gap: Spacing.sm,
  },
  optionRowNeutral: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  optionRowCorrect: {
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  optionText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  optionTextCorrect: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.success,
  },
});
