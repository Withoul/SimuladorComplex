import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';
import { getMonthName, getDayNames, getDaysInMonth, getFirstDayOfMonth } from '../utils/helpers';

export default function CalendarGrid({ 
  year, 
  month, 
  studyDays, 
  complexExamDate, 
  onPrevMonth, 
  onNextMonth, 
  onSelectDay 
}) {
  const dayNames = getDayNames();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const renderDays = () => {
    const cells = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const isStudied = studyDays.includes(dateStr);
      const isExamDay = dateStr === complexExamDate;

      cells.push(
        <TouchableOpacity 
          key={day} 
          style={styles.dayCell}
          onPress={() => onSelectDay && onSelectDay(dateStr)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.dayCircle,
            isToday && styles.dayCircleToday,
            isExamDay && styles.dayCircleExam,
          ]}>
            {isExamDay ? (
              <Ionicons name="flag" size={16} color={Colors.white} />
            ) : (
              <Text style={[
                styles.dayText,
                isToday && styles.dayTextToday,
                isExamDay && styles.dayTextExam,
              ]}>
                {day}
              </Text>
            )}
          </View>
          <View style={styles.cellFooter}>
            {isStudied && <View style={styles.studiedDot} />}
            {isExamDay && <Text style={styles.examIndicatorText}>Exam</Text>}
          </View>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Calendario de{'\n'}Estudio</Text>
          <Text style={styles.monthYear}>{getMonthName(month)} {year}</Text>
        </View>
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={onPrevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Day names row */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((name) => (
          <Text key={name} style={styles.dayName}>{name}</Text>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {renderDays()}
      </View>
      
      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.calendarDot }]} />
          <Text style={styles.legendText}>Día estudiado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E65100' }]} />
          <Text style={styles.legendText}>Examen Complexivo</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Rounded.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    elevation: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  monthYear: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleToday: {
    backgroundColor: Colors.primary,
  },
  dayCircleExam: {
    backgroundColor: '#E65100', // Beautiful crimson-orange for the target exam
  },
  dayText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dayTextToday: {
    color: Colors.white,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  dayTextExam: {
    color: Colors.white,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  cellFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 2,
    height: 12,
  },
  studiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.calendarDot,
  },
  examIndicatorText: {
    fontSize: 8,
    color: '#E65100',
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
