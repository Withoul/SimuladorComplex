import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';
import ProgressBar from '../components/ProgressBar';
import {
  getUserName, getTotalStats, getBestStreak, getCurrentStreak,
  getNotificationSettings, saveNotificationSettings,
} from '../services/storage';
import {
  requestNotificationPermissions, scheduleStudyReminder, cancelAllReminders,
} from '../services/notifications';

const INTERVAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ProfileScreen() {
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({ totalAnswered: 0, totalCorrect: 0 });
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [intervalHours, setIntervalHours] = useState(4);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const loadAll = async () => {
    const name = await getUserName();
    setUserName(name || 'Estudiante');
    const s = await getTotalStats();
    setStats(s);
    const best = await getBestStreak();
    setBestStreak(best);
    const curr = await getCurrentStreak();
    setCurrentStreak(curr);
    const notifSettings = await getNotificationSettings();
    setNotificationsEnabled(notifSettings.enabled);
    setIntervalHours(notifSettings.intervalHours);
  };

  const handleToggleNotifications = async (value) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permisos requeridos',
          'Necesitas otorgar permisos de notificaciones para activar los recordatorios.',
        );
        return;
      }
      await scheduleStudyReminder(intervalHours);
    } else {
      await cancelAllReminders();
    }
    setNotificationsEnabled(value);
    await saveNotificationSettings(value, intervalHours);
  };

  const handleIntervalChange = async (hours) => {
    setIntervalHours(hours);
    await saveNotificationSettings(notificationsEnabled, hours);
    if (notificationsEnabled) {
      await scheduleStudyReminder(hours);
    }
  };

  const accuracy = stats.totalAnswered > 0
    ? ((stats.totalCorrect / stats.totalAnswered) * 100).toFixed(1)
    : '0.0';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={36} color={Colors.white} />
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userSubtitle}>Estudiante activo</Text>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Estadísticas Generales</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.totalAnswered}</Text>
            <Text style={styles.statLabel}>Preguntas respondidas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>{stats.totalCorrect}</Text>
            <Text style={styles.statLabel}>Respuestas correctas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: Colors.primary }]}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Precisión</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: Colors.secondary }]}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Mejor racha</Text>
          </View>
        </View>

        {/* Accuracy Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Precisión Global</Text>
            <Text style={styles.progressValue}>{accuracy}%</Text>
          </View>
          <ProgressBar
            progress={stats.totalAnswered > 0 ? stats.totalCorrect / stats.totalAnswered : 0}
            height={8}
            color={Colors.success}
          />
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notificaciones</Text>

        <View style={styles.notifCard}>
          <View style={styles.notifRow}>
            <View style={styles.notifIconContainer}>
              <Ionicons name="notifications" size={22} color={Colors.primary} />
            </View>
            <View style={styles.notifTextContainer}>
              <Text style={styles.notifTitle}>Recordatorios de estudio</Text>
              <Text style={styles.notifSubtitle}>
                {notificationsEnabled
                  ? `Cada ${intervalHours} hora${intervalHours > 1 ? 's' : ''}`
                  : 'Desactivados'}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: Colors.surfaceDim, true: Colors.primaryLight }}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.outline}
            />
          </View>

          {notificationsEnabled && (
            <View style={styles.intervalSection}>
              <Text style={styles.intervalLabel}>Repetir cada:</Text>
              <View style={styles.intervalOptions}>
                {INTERVAL_OPTIONS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.intervalBtn,
                      intervalHours === h && styles.intervalBtnActive,
                    ]}
                    onPress={() => handleIntervalChange(h)}
                  >
                    <Text style={[
                      styles.intervalBtnText,
                      intervalHours === h && styles.intervalBtnTextActive,
                    ]}>
                      {h}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Current Streak */}
        <View style={styles.streakCard}>
          <Ionicons name="flame" size={28} color={Colors.secondary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.streakNumber}>{currentStreak} días</Text>
            <Text style={styles.streakLabel}>Racha actual</Text>
          </View>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statBox: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  statNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
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
  progressTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success,
  },
  notifCard: {
    backgroundColor: Colors.white,
    borderRadius: Rounded.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: Spacing.lg,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Rounded.lg,
    backgroundColor: Colors.primaryOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  notifTextContainer: {
    flex: 1,
  },
  notifTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  notifSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  intervalSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  intervalLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  intervalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intervalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Rounded.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.white,
  },
  intervalBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  intervalBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  intervalBtnTextActive: {
    color: Colors.white,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryOverlay,
    borderRadius: Rounded.xl,
    padding: Spacing.xl,
  },
  streakNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  streakLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
