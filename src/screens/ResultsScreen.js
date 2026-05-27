import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';
import ProgressBar from '../components/ProgressBar';

export default function ResultsScreen({ route, navigation }) {
  const { mode, total, correct, errors } = route.params;
  const incorrect = total - correct;
  const percentage = total > 0 ? ((correct / total) * 100).toFixed(1) : '0.0';

  const getGradeColor = () => {
    const pct = parseFloat(percentage);
    if (pct >= 80) return Colors.success;
    if (pct >= 60) return Colors.secondary;
    if (pct >= 40) return '#FF9800';
    return Colors.error;
  };

  const getGradeEmoji = () => {
    const pct = parseFloat(percentage);
    if (pct >= 90) return '🏆';
    if (pct >= 80) return '⭐';
    if (pct >= 60) return '👍';
    if (pct >= 40) return '📝';
    return '💪';
  };

  const getGradeMessage = () => {
    const pct = parseFloat(percentage);
    if (pct >= 90) return '¡Excelente! Dominas el tema.';
    if (pct >= 80) return '¡Muy bien! Sigue así.';
    if (pct >= 60) return '¡Buen trabajo! Sigue practicando.';
    if (pct >= 40) return 'Puedes mejorar. ¡No te rindas!';
    return 'Necesitas más práctica. ¡Tú puedes!';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Grade Circle */}
        <View style={styles.gradeContainer}>
          <Text style={styles.emoji}>{getGradeEmoji()}</Text>
          <Text style={[styles.percentage, { color: getGradeColor() }]}>
            {percentage}%
          </Text>
          <Text style={styles.gradeMessage}>{getGradeMessage()}</Text>
          <Text style={styles.modeLabel}>{mode}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statBox, { borderColor: Colors.success }]}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>{correct}</Text>
            <Text style={styles.statLabel}>Correctas</Text>
          </View>
          <View style={[styles.statBox, { borderColor: Colors.error }]}>
            <Text style={[styles.statNumber, { color: Colors.error }]}>{incorrect}</Text>
            <Text style={styles.statLabel}>Incorrectas</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Precisión</Text>
            <Text style={[styles.progressValue, { color: getGradeColor() }]}>
              {percentage}%
            </Text>
          </View>
          <ProgressBar
            progress={total > 0 ? correct / total : 0}
            height={10}
            color={getGradeColor()}
          />
        </View>

        {/* Error Details */}
        {errors && errors.length > 0 && (
          <View style={styles.errorsSection}>
            <Text style={styles.errorsSectionTitle}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              {'  '}Detalle de Respuestas Incorrectas
            </Text>
            {errors.map((error, index) => (
              <View key={index} style={styles.errorCard}>
                <View style={styles.errorNumberBadge}>
                  <Text style={styles.errorNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.errorContent}>
                  <Text style={styles.errorQuestion} numberOfLines={3}>
                    {error.pregunta}
                  </Text>
                  <View style={styles.errorAnswerRow}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.errorAnswer}>{error.correcta}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="refresh" size={20} color={Colors.white} />
            <Text style={styles.retryButtonText}>Nuevo simulacro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.popToTop()}
          >
            <Ionicons name="home-outline" size={20} color={Colors.primary} />
            <Text style={styles.homeButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  gradeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  percentage: {
    fontFamily: 'Inter_700Bold',
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 64,
  },
  gradeMessage: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  modeLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
    marginTop: Spacing.sm,
    backgroundColor: Colors.primaryOverlay,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Rounded.full,
    overflow: 'hidden',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  statNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: Spacing.xxl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    fontWeight: '700',
  },
  errorsSection: {
    marginBottom: Spacing.xxl,
  },
  errorsSectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  errorCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.errorContainer,
    marginBottom: Spacing.md,
  },
  errorNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.errorContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  errorNumberText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
  errorContent: {
    flex: 1,
  },
  errorQuestion: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  errorAnswerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  errorAnswer: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.success,
    lineHeight: 18,
  },
  buttons: {
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
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: Rounded.lg,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: 8,
  },
  homeButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});
