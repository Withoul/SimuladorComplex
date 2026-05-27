import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';
import CalendarGrid from '../components/CalendarGrid';
import ProgressBar from '../components/ProgressBar';
import { getStudyDays, getCurrentStreak } from '../services/storage';
import { getMonthName } from '../utils/helpers';

const MOTIVATIONAL_QUOTES = [
  '"La persistencia es el camino al éxito."',
  '"El conocimiento es poder."',
  '"Cada día es una nueva oportunidad de aprender."',
  '"La disciplina es el puente entre metas y logros."',
  '"No cuentes los días, haz que los días cuenten."',
];

export default function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [studyDays, setStudyDays] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const days = await getStudyDays();
    const streak = await getCurrentStreak();
    setStudyDays(days);
    setCurrentStreak(streak);
  };

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Count studied days in current displayed month
  const daysThisMonth = studyDays.filter((d) => {
    const [y, m] = d.split('-').map(Number);
    return y === year && m - 1 === month;
  }).length;

  const monthGoal = 20;
  const progress = daysThisMonth / monthGoal;
  const quote = MOTIVATIONAL_QUOTES[month % MOTIVATIONAL_QUOTES.length];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar */}
        <CalendarGrid
          year={year}
          month={month}
          studyDays={studyDays}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Monthly Metrics */}
        <View style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>
            MÉTRICAS DE {getMonthName(month).toUpperCase()}
          </Text>

          <View style={styles.metricsRow}>
            <Text style={styles.metricsNumber}>{daysThisMonth}</Text>
            <Text style={styles.metricsLabel}>Días estudiados</Text>
          </View>

          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color={Colors.white} />
            <Text style={styles.streakBadgeText}>{currentStreak} días</Text>
            <Text style={styles.streakBadgeSubtext}>Racha actual</Text>
          </View>

          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Meta mensual: {monthGoal} días</Text>
            <Text style={styles.goalPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <ProgressBar progress={progress} height={6} />
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>{quote}</Text>
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 100,
  },
  metricsCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Rounded.xl,
    padding: Spacing.xl,
    marginTop: Spacing.lg,
  },
  metricsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onPrimaryContainer,
    letterSpacing: 1,
    marginBottom: Spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.lg,
    gap: 10,
  },
  metricsNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    fontWeight: '700',
    color: Colors.white,
  },
  metricsLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.onPrimaryContainer,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Rounded.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: 8,
  },
  streakBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.secondary,
  },
  streakBadgeSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.onPrimaryContainer,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.onPrimaryContainer,
  },
  goalPercent: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  quoteCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Rounded.xl,
    padding: Spacing.xxl,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  quoteText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 28,
  },
});
