import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import QUESTIONS from '../data/questions';
import { selectRandomQuestions, prepareQuestion } from '../utils/helpers';
import { addPoints, markStudyDay, updateStreak, addToStats } from '../services/storage';

const PRESET_COUNTS = [10, 20, 30, 50, 100, 400];

export default function ModoAleatorioScreen({ route, navigation }) {
  const { presetQuestions, isSequential, title } = route?.params || {};
  
  const [phase, setPhase] = useState(presetQuestions ? 'quiz' : 'setup'); // 'setup' | 'quiz'
  const [questionCount, setQuestionCount] = useState(20);
  const [customCount, setCustomCount] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState([]);
  const [prepared, setPrepared] = useState(null);

  // If preset questions are passed, initialize them immediately
  useEffect(() => {
    if (presetQuestions && presetQuestions.length > 0) {
      const selected = isSequential ? [...presetQuestions] : selectRandomQuestions([...presetQuestions], presetQuestions.length);
      setQuestions(selected);
      setCurrentIndex(0);
      setCorrect(0);
      setErrors([]);
      setPrepared(prepareQuestion(selected[0]));
      setPhase('quiz');
    }
  }, [presetQuestions, isSequential]);

  const startQuiz = () => {
    const count = customCount ? Math.min(parseInt(customCount) || 20, 400) : questionCount;
    const selected = selectRandomQuestions([...QUESTIONS], count);
    setQuestions(selected);
    setCurrentIndex(0);
    setCorrect(0);
    setErrors([]);
    setPrepared(prepareQuestion(selected[0]));
    setPhase('quiz');
  };

  const handleAnswer = async (isCorrect, correctText) => {
    if (isCorrect) {
      setCorrect((c) => c + 1);
      await addPoints(5);
    } else {
      setErrors((prev) => [
        ...prev,
        {
          pregunta: questions[currentIndex].enunciado,
          correcta: correctText,
        },
      ]);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setPrepared(prepareQuestion(questions[nextIndex]));
    } else {
      // Quiz finished
      const totalCorrect = isCorrect ? correct + 1 : correct;
      const totalErrors = isCorrect
        ? errors
        : [...errors, { pregunta: questions[currentIndex].enunciado, correcta: correctText }];

      await addToStats(questions.length, totalCorrect);
      await markStudyDay();
      await updateStreak();

      navigation.replace('Results', {
        mode: title || 'Modo Aleatorio',
        total: questions.length,
        correct: totalCorrect,
        errors: totalErrors,
      });
    }
  };

  if (phase === 'setup') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.setupContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backArrow}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.setupIconContainer}>
            <Ionicons name="dice-outline" size={48} color={Colors.secondary} />
          </View>

          <Text style={styles.setupTitle}>Modo Aleatorio</Text>
          <Text style={styles.setupSubtitle}>
            Selecciona la cantidad de preguntas para tu simulacro
          </Text>

          <View style={styles.presetGrid}>
            {PRESET_COUNTS.map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.presetBtn,
                  questionCount === count && !customCount && styles.presetBtnActive,
                ]}
                onPress={() => {
                  setQuestionCount(count);
                  setCustomCount('');
                }}
              >
                <Text style={[
                  styles.presetBtnText,
                  questionCount === count && !customCount && styles.presetBtnTextActive,
                ]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customInputContainer}>
            <Text style={styles.customLabel}>O ingresa un número personalizado (máx. 400):</Text>
            <TextInput
              style={styles.customInput}
              keyboardType="number-pad"
              placeholder="Ej: 15"
              placeholderTextColor={Colors.textTertiary}
              value={customCount}
              onChangeText={(text) => {
                const num = text.replace(/[^0-9]/g, '');
                setCustomCount(num);
              }}
              maxLength={3}
            />
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
            <Ionicons name="play" size={20} color={Colors.white} />
            <Text style={styles.startButtonText}>Comenzar Simulacro</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{title || 'Simulacro'}</Text>
        <Text style={styles.headerProgress}>{currentIndex + 1}/{questions.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          progress={(currentIndex + 1) / questions.length}
          height={6}
          color={Colors.secondary}
        />
      </View>

      <QuestionCard
        question={prepared}
        shuffledOptions={prepared.shuffledOptions}
        correctIndex={prepared.correctIndex}
        onAnswer={handleAnswer}
        progressText={`Pregunta ${currentIndex + 1} de ${questions.length}`}
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
  setupContainer: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  backArrow: {
    position: 'absolute',
    top: 20,
    left: Spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.secondaryOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  setupTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  setupSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 22,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  presetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Rounded.lg,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.white,
    minWidth: 72,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  presetBtnTextActive: {
    color: Colors.white,
  },
  customInputContainer: {
    marginBottom: Spacing.xxl,
  },
  customLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  customInput: {
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    backgroundColor: Colors.white,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: Rounded.lg,
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  // Quiz header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
  headerProgress: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
});
