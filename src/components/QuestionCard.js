import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Rounded } from '../theme';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
  question,
  shuffledOptions,
  correctIndex,
  onAnswer,
  progressText,
  streakText,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelectedIndex(null);
    setShowResult(false);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [question]);

  const handleSelect = (index) => {
    if (showResult) return;
    setSelectedIndex(index);
    setShowResult(true);

    const isCorrect = index === correctIndex;

    // Wait briefly to show feedback before moving on
    setTimeout(() => {
      onAnswer(isCorrect, shuffledOptions[correctIndex]);
    }, 1200);
  };

  const getOptionStyle = (index) => {
    if (!showResult) {
      return selectedIndex === index ? styles.optionSelected : styles.option;
    }

    if (index === correctIndex) {
      return styles.optionCorrect;
    }
    if (index === selectedIndex && index !== correctIndex) {
      return styles.optionWrong;
    }
    return styles.option;
  };

  const getOptionTextStyle = (index) => {
    if (!showResult) {
      return selectedIndex === index ? styles.optionTextSelected : styles.optionText;
    }

    if (index === correctIndex) {
      return styles.optionTextCorrect;
    }
    if (index === selectedIndex && index !== correctIndex) {
      return styles.optionTextWrong;
    }
    return styles.optionText;
  };

  const getLetterStyle = (index) => {
    if (!showResult) {
      return selectedIndex === index ? styles.letterBadgeSelected : styles.letterBadge;
    }
    if (index === correctIndex) {
      return styles.letterBadgeCorrect;
    }
    if (index === selectedIndex && index !== correctIndex) {
      return styles.letterBadgeWrong;
    }
    return styles.letterBadge;
  };

  const getLetterTextStyle = (index) => {
    if (!showResult) {
      return selectedIndex === index ? styles.letterTextSelected : styles.letterText;
    }
    if (index === correctIndex) {
      return styles.letterTextCorrect;
    }
    if (index === selectedIndex && index !== correctIndex) {
      return styles.letterTextWrong;
    }
    return styles.letterText;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {(progressText || streakText) && (
        <View style={styles.headerRow}>
          {progressText && <Text style={styles.progressText}>{progressText}</Text>}
          {streakText && <Text style={styles.streakText}>{streakText}</Text>}
        </View>
      )}

      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{question.enunciado}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {shuffledOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(index)}
            onPress={() => handleSelect(index)}
            activeOpacity={0.7}
            disabled={showResult}
          >
            <View style={getLetterStyle(index)}>
              <Text style={getLetterTextStyle(index)}>{OPTION_LETTERS[index]}</Text>
            </View>
            <Text style={getOptionTextStyle(index)} numberOfLines={4}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  progressText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  streakText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: '700',
  },
  questionBox: {
    backgroundColor: Colors.white,
    borderRadius: Rounded.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  questionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
  },
  optionSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryOverlay,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  optionCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.success,
  },
  optionWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorContainer,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: Rounded.md,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  letterBadgeSelected: {
    width: 32,
    height: 32,
    borderRadius: Rounded.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  letterBadgeCorrect: {
    width: 32,
    height: 32,
    borderRadius: Rounded.md,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  letterBadgeWrong: {
    width: 32,
    height: 32,
    borderRadius: Rounded.md,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  letterText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  letterTextSelected: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  letterTextCorrect: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  letterTextWrong: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  optionText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  optionTextSelected: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: 22,
  },
  optionTextCorrect: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.success,
    lineHeight: 22,
  },
  optionTextWrong: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
    lineHeight: 22,
  },
});
