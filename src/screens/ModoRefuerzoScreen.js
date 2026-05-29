import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Rounded } from '../theme';
import QUESTIONS from '../data/questions';
import { getQuestionHistory } from '../services/storage';

export default function ModoRefuerzoScreen({ navigation }) {
  const [showOnlyCorrect, setShowOnlyCorrect] = useState(false);
  const [reinforceQuestions, setReinforceQuestions] = useState([]);
  const [historyMap, setHistoryMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadQuestions();
    }, [])
  );

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const history = await getQuestionHistory();
      setHistoryMap(history);
      
      // Filter questions: answered at least once and not 100% correct
      const filtered = QUESTIONS.filter(q => {
        const attempts = history[q.id];
        if (!attempts || attempts.length === 0) return false;
        
        // Count correct answers in the attempts (up to last 10)
        const correctCount = attempts.filter(x => x === true).length;
        const accuracy = correctCount / attempts.length;
        
        // Keep if accuracy < 100% (accuracy < 1.0)
        return accuracy < 1.0;
      });
      
      setReinforceQuestions(filtered);
    } catch (err) {
      console.error("Error loading reinforcement questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (reinforceQuestions.length === 0) return;
    navigation.navigate('ModoAleatorio', {
      presetQuestions: reinforceQuestions,
      isSequential: false,
      title: 'Quiz de Refuerzo'
    });
  };

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
          <Text style={styles.questionNumber}>Refuerzo {index + 1}</Text>
          
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
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Modo Refuerzo</Text>
            <Text style={styles.headerSubtitle}>
              {reinforceQuestions.length} preguntas por reforzar
            </Text>
          </View>
        </View>
      </View>
      
      {reinforceQuestions.length > 0 && (
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Mostrar solo respuestas correctas</Text>
          <Switch
            value={showOnlyCorrect}
            onValueChange={setShowOnlyCorrect}
            trackColor={{ false: Colors.surfaceDim, true: Colors.successLight }}
            thumbColor={showOnlyCorrect ? Colors.success : Colors.outline}
          />
        </View>
      )}

      {isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Cargando preguntas...</Text>
        </View>
      ) : reinforceQuestions.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="checkmark-done-circle" size={80} color={Colors.success} />
          </View>
          <Text style={styles.emptyStateTitle}>¡Todo al 100%!</Text>
          <Text style={styles.emptyStateSubtitle}>
            No tienes preguntas con errores pendientes. ¡Excelente trabajo y sigue así!
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={reinforceQuestions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.startButton} onPress={handleStartQuiz}>
              <Ionicons name="play" size={20} color={Colors.white} />
              <Text style={styles.startButtonText}>¡Iniciar Simulacro de Refuerzo!</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
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
    paddingBottom: 120, // space for footer
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyStateTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Rounded.lg,
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
