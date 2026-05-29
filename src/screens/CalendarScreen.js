import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';
import CalendarGrid from '../components/CalendarGrid';
import ProgressBar from '../components/ProgressBar';
import { 
  getStudyDays, 
  getCurrentStreak, 
  getComplexExamDate, 
  saveComplexExamDate, 
  getStudyTime 
} from '../services/storage';
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
  const [complexExamDate, setComplexExamDate] = useState(null);
  const [hoursStudied, setHoursStudied] = useState('0.0');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [year, month])
  );

  const loadData = async () => {
    const days = await getStudyDays();
    const streak = await getCurrentStreak();
    const examDate = await getComplexExamDate();
    const timeData = await getStudyTime();

    setStudyDays(days);
    setCurrentStreak(streak);
    setComplexExamDate(examDate);

    // Calculate active study time for current displayed month/year
    let secondsThisMonth = 0;
    Object.entries(timeData).forEach(([dateStr, sec]) => {
      const [y, m] = dateStr.split('-').map(Number);
      if (y === year && m - 1 === month) {
        secondsThisMonth += sec;
      }
    });

    const hours = (secondsThisMonth / 3600).toFixed(1);
    setHoursStudied(hours);
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

  const handleSelectDay = (dateStr) => {
    const isExam = dateStr === complexExamDate;
    Alert.alert(
      isExam ? 'Quitar Marcador' : 'Marcar Examen Complexivo',
      isExam 
        ? `¿Deseas quitar el marcador de Examen Complexivo para el ${dateStr}?`
        : `¿Deseas marcar el día ${dateStr} como la fecha de tu Examen Complexivo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Aceptar', 
          onPress: async () => {
            const newDate = isExam ? null : dateStr;
            await saveComplexExamDate(newDate);
            setComplexExamDate(newDate);
            loadData();
          } 
        }
      ]
    );
  };

  // Count studied days in current displayed month
  const daysThisMonth = studyDays.filter((d) => {
    const [y, m] = d.split('-').map(Number);
    return y === year && m - 1 === month;
  }).length;

  const monthGoal = 20;
  const progress = daysThisMonth / monthGoal;
  const quote = MOTIVATIONAL_QUOTES[month % MOTIVATIONAL_QUOTES.length];

  // Calculate days remaining for the exam if marked
  const getExamCountdown = () => {
    if (!complexExamDate) return null;
    const exam = new Date(complexExamDate);
    const today = new Date();
    
    // Clear time portions for accurate day differences
    exam.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '🏁 ¡Es HOY! Mucha suerte en tu Examen Complexivo.';
    if (diffDays < 0) return `El Examen Complexivo fue hace ${Math.abs(diffDays)} día(s).`;
    return `🎯 Faltan ${diffDays} día(s) para tu Examen Complexivo.`;
  };

  const countdownText = getExamCountdown();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Grid */}
        <CalendarGrid
          year={year}
          month={month}
          studyDays={studyDays}
          complexExamDate={complexExamDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectDay={handleSelectDay}
        />

        {/* Countdown Banner */}
        <View style={[styles.countdownCard, complexExamDate ? styles.countdownActive : styles.countdownInactive]}>
          <Ionicons 
            name={complexExamDate ? "bookmark" : "information-circle-outline"} 
            size={22} 
            color={complexExamDate ? '#FFF' : Colors.textPrimary} 
          />
          <Text style={[styles.countdownText, complexExamDate ? styles.countdownTextActive : styles.countdownTextInactive]}>
            {countdownText || "Toca un día en el calendario para marcar tu fecha de Examen Complexivo."}
          </Text>
        </View>

        {/* Monthly Metrics */}
        <View style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>
            MÉTRICAS DE {getMonthName(month).toUpperCase()}
          </Text>

          <View style={styles.statsPanel}>
            <View style={styles.metricColumn}>
              <Text style={styles.metricsNumber}>{daysThisMonth}</Text>
              <Text style={styles.metricsLabel}>Días estudiados</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricColumn}>
              <Text style={styles.metricsNumber}>{hoursStudied}h</Text>
              <Text style={styles.metricsLabel}>Tiempo total</Text>
            </View>
          </View>

          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={22} color={Colors.secondary} />
            <View>
              <Text style={styles.streakBadgeText}>{currentStreak} días consecutivos</Text>
              <Text style={styles.streakBadgeSubtext}>Racha actual de estudio</Text>
            </View>
          </View>

          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Meta mensual: {monthGoal} días</Text>
            <Text style={styles.goalPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <ProgressBar progress={progress} height={8} color={Colors.secondary} />
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
  countdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Rounded.xl,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    gap: 10,
    borderWidth: 1,
  },
  countdownActive: {
    backgroundColor: '#E65100',
    borderColor: '#D84315',
  },
  countdownInactive: {
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.outlineVariant,
  },
  countdownText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  countdownTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  countdownTextInactive: {
    color: Colors.textSecondary,
  },
  metricsCard: {
    backgroundColor: Colors.primaryDark, // Dark blue palette!
    borderRadius: Rounded.xl,
    padding: Spacing.xl,
    marginTop: Spacing.lg,
    elevation: 2,
  },
  metricsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.inversePrimary,
    letterSpacing: 1,
    marginBottom: Spacing.lg,
  },
  statsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  metricColumn: {
    alignItems: 'center',
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  metricsNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 38,
    fontWeight: '700',
    color: Colors.white,
  },
  metricsLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.inversePrimary,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Rounded.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: 12,
  },
  streakBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  streakBadgeSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.inversePrimary,
    marginTop: 1,
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
    color: Colors.inversePrimary,
  },
  goalPercent: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  quoteCard: {
    backgroundColor: Colors.primaryLight,
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
