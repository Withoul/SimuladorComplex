import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';
import QuestionCard from '../components/QuestionCard';
import QUESTIONS from '../data/questions';
import { shuffleArray, prepareQuestion } from '../utils/helpers';
import { addPoints, markStudyDay, updateStreak, addToStats } from '../services/storage';

export default function RachaInfinitaScreen({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState('');
  const [prepared, setPrepared] = useState(null);

  useEffect(() => {
    const shuffled = shuffleArray([...QUESTIONS]);
    setQuestions(shuffled);
    setPrepared(prepareQuestion(shuffled[0]));
  }, []);

  const handleAnswer = async (isCorrect, correctText) => {
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      await addPoints(10);
      await markStudyDay();
      await updateStreak();

      const nextIndex = currentIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentIndex(nextIndex);
        setPrepared(prepareQuestion(questions[nextIndex]));
      } else {
        // All questions answered
        await addToStats(newStreak, newStreak);
        navigation.replace('Results', {
          mode: 'Racha Infinita',
          total: newStreak,
          correct: newStreak,
          errors: [],
        });
      }
    } else {
      setLastCorrectAnswer(correctText);
      setGameOver(true);
      await addToStats(streak + 1, streak);
      await markStudyDay();
      await updateStreak();
    }
  };

  if (gameOver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameOverContainer}>
          <View style={styles.gameOverIcon}>
            <Ionicons name="flame" size={64} color={Colors.secondary} />
          </View>
          <Text style={styles.gameOverTitle}>¡Racha terminada!</Text>
          <Text style={styles.gameOverStreak}>{streak}</Text>
          <Text style={styles.gameOverLabel}>preguntas correctas consecutivas</Text>

          <View style={styles.gameOverInfoCard}>
            <Ionicons name="close-circle" size={20} color={Colors.error} />
            <Text style={styles.gameOverInfoText}>
              La respuesta correcta era:{'\n'}
              <Text style={styles.gameOverCorrectText}>{lastCorrectAnswer}</Text>
            </Text>
          </View>

          <View style={styles.gameOverButtons}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                const shuffled = shuffleArray([...QUESTIONS]);
                setQuestions(shuffled);
                setCurrentIndex(0);
                setStreak(0);
                setGameOver(false);
                setPrepared(prepareQuestion(shuffled[0]));
              }}
            >
              <Ionicons name="refresh" size={20} color={Colors.white} />
              <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Volver al menú</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!prepared) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Racha Infinita</Text>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color={Colors.secondary} />
          <Text style={styles.streakBadgeText}>{streak}</Text>
        </View>
      </View>

      <QuestionCard
        question={prepared}
        shuffledOptions={prepared.shuffledOptions}
        correctIndex={prepared.correctIndex}
        onAnswer={handleAnswer}
        streakText={`🔥 Racha: ${streak}`}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryOverlay,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Rounded.full,
    gap: 4,
  },
  streakBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  // Game Over
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  gameOverIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondaryOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  gameOverTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  gameOverStreak: {
    fontFamily: 'Inter_700Bold',
    fontSize: 64,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 72,
  },
  gameOverLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  gameOverInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.errorContainer,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    width: '100%',
    gap: 10,
    marginBottom: Spacing.xxl,
  },
  gameOverInfoText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  gameOverCorrectText: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: Colors.success,
  },
  gameOverButtons: {
    width: '100%',
    gap: Spacing.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Rounded.lg,
    paddingVertical: 16,
    gap: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  backButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
