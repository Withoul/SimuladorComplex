import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';
import { getMonthName, getDayNames, getDaysInMonth, getFirstDayOfMonth } from '../utils/helpers';

export default function CalendarGrid({ year, month, studyDays, onPrevMonth, onNextMonth }) {
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

      cells.push(
        <View key={day} style={styles.dayCell}>
          <View style={[
            styles.dayCircle,
            isToday && styles.dayCircleToday,
          ]}>
            <Text style={[
              styles.dayText,
              isToday && styles.dayTextToday,
            ]}>
              {day}
            </Text>
          </View>
          {isStudied && <View style={styles.studiedDot} />}
        </View>
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
    paddingVertical: 6,
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
  studiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.calendarDot,
    marginTop: 2,
  },
});
