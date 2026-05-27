import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';
import QUESTIONS from '../data/questions';

export default function ModoRepasoStudyScreen({ route, navigation }) {
  const { start, end } = route.params;

  // slice range (start and end are 1-indexed for the user)
  const selectedQuestions = useMemo(() => {
    return QUESTIONS.slice(start - 1, end);
  }, [start, end]);

  const handleStartQuiz = () => {
    // Navigate to quiz bypassing setup, with the exact sequential questions
    navigation.navigate('ModoAleatorio', {
      presetQuestions: selectedQuestions,
      isSequential: true,
      title: 'Quiz por Temario'
    });
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.questionNumber}>Pregunta {start + index}</Text>
      <Text style={styles.questionText}>{item.enunciado}</Text>
      <View style={styles.answerRow}>
        <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
        <Text style={styles.answerText}>{item.respuestaCorrecta}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Repaso ({start}-{end})</Text>
      </View>

      <FlatList
        data={selectedQuestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartQuiz}>
          <Ionicons name="play" size={20} color={Colors.white} />
          <Text style={styles.startButtonText}>¡Empezar Quiz!</Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.textPrimary,
  },
  listContent: {
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  questionNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  questionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.successLight,
    padding: Spacing.md,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: Colors.success,
    gap: Spacing.sm,
  },
  answerText: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.success,
    lineHeight: 20,
  },
  footer: {
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    elevation: 8,
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
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});
