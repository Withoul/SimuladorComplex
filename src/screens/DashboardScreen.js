import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, Modal,
  TextInput, TouchableOpacity, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';
import ModeCard from '../components/ModeCard';
import StatCard from '../components/StatCard';
import {
  getUserName, saveUserName, getPointsToday,
  getCurrentStreak, getNotificationSettingsComplex, saveNotificationSettingsComplex
} from '../services/storage';
import {
  requestNotificationPermissions, scheduleStudyReminder, cancelAllReminders
} from '../services/notifications';

export default function DashboardScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [pointsToday, setPointsToday] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(null);

  useEffect(() => {
    checkUserName();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const checkUserName = async () => {
    const name = await getUserName();
    if (name) {
      setUserName(name);
    } else {
      setShowNameModal(true);
    }
  };

  const handleSaveName = async () => {
    const name = nameInput.trim() || 'Estudiante';
    await saveUserName(name);
    setUserName(name);
    setShowNameModal(false);
  };

  const loadStats = async () => {
    const points = await getPointsToday();
    const streak = await getCurrentStreak();
    setPointsToday(points);
    setCurrentStreak(streak);

    const notif = await getNotificationSettingsComplex();
    setNotificationSettings(notif);
    setNotificationsEnabled(notif.enabled);
  };

  const handleToggleNotifications = async () => {
    const nextVal = !notificationsEnabled;
    if (nextVal) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permisos requeridos',
          'Necesitas otorgar permisos de notificaciones para activar los recordatorios.',
        );
        return;
      }
      
      const interval = notificationSettings?.intervalHours || 4;
      await scheduleStudyReminder(interval);
      
      const newSettings = {
        ...notificationSettings,
        enabled: true,
        intervalHours: interval
      };
      setNotificationSettings(newSettings);
      await saveNotificationSettingsComplex(newSettings);
      setNotificationsEnabled(true);
      Alert.alert('Recordatorios activos', 'Se han activado los recordatorios de estudio.');
    } else {
      await cancelAllReminders();
      const newSettings = {
        ...notificationSettings,
        enabled: false
      };
      setNotificationSettings(newSettings);
      await saveNotificationSettingsComplex(newSettings);
      setNotificationsEnabled(false);
      Alert.alert('Recordatorios desactivados', 'Se han desactivado los recordatorios de estudio.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Name Input Modal */}
      <Modal visible={showNameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="person-circle" size={64} color={Colors.primary} />
            </View>
            <Text style={styles.modalTitle}>¡Bienvenido!</Text>
            <Text style={styles.modalSubtitle}>¿Cómo te llamas?</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tu nombre..."
              placeholderTextColor={Colors.textTertiary}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              onSubmitEditing={handleSaveName}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveName}>
              <Text style={styles.modalButtonText}>Comenzar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hola, <Text style={styles.greetingName}>{userName}</Text>
            </Text>
            <Text style={styles.subtitle}>¿Qué desafío conquistaremos hoy?</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.notifButton, 
              notificationsEnabled && styles.notifButtonActive
            ]} 
            onPress={handleToggleNotifications}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={notificationsEnabled ? "notifications" : "notifications-outline"} 
              size={24} 
              color={notificationsEnabled ? Colors.white : Colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label="PUNTOS HOY" value={pointsToday.toLocaleString()} />
          <View style={{ width: Spacing.md }} />
          <StatCard
            label="RACHA"
            value={currentStreak}
            icon="🔥"
            color={Colors.secondary}
          />
        </View>

        {/* Modes Section */}
        <Text style={styles.sectionTitle}>Modos de Estudio</Text>

        <ModeCard
          title="Modo Racha Infinita"
          subtitle="Responde hasta fallar"
          iconName="infinite"
          iconBgColor="rgba(38, 34, 189, 0.12)"
          onPress={() => navigation.navigate('RachaInfinita')}
        />

        <ModeCard
          title="Modo Racha por Tiempo"
          subtitle="15 segundos por pregunta"
          iconName="timer-outline"
          iconBgColor="rgba(92, 89, 206, 0.15)"
          onPress={() => navigation.navigate('RachaTiempo')}
        />

        <ModeCard
          title="Modo Aleatorio"
          subtitle="Simulacro con promedio"
          iconName="dice-outline"
          iconBgColor="rgba(250, 199, 15, 0.2)"
          onPress={() => navigation.navigate('ModoAleatorio')}
        />

        <ModeCard
          title="Modo Refuerzo"
          subtitle="Estudia y responde preguntas erradas"
          iconName="barbell-outline"
          iconBgColor="rgba(230, 81, 0, 0.15)"
          onPress={() => navigation.navigate('ModoRefuerzo')}
        />

        <ModeCard
          title="Estudio por Temario"
          subtitle="Repasa y luego evalúate"
          iconName="book-outline"
          iconBgColor="rgba(38, 34, 189, 0.12)"
          onPress={() => navigation.navigate('ModoRepasoSetup')}
        />

        <ModeCard
          title="Cuestionario Fijo"
          subtitle="Preguntas en orden secuencial"
          iconName="list-outline"
          iconBgColor="rgba(46, 125, 50, 0.15)"
          onPress={() => navigation.navigate('ModoFijoSetup')}
        />

        {/* Question count info */}
        <View style={styles.infoCard}>
          <Ionicons name="library-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Base de datos: <Text style={styles.infoBold}>400 preguntas</Text> listas para practicar
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 36,
  },
  greetingName: {
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  notifButtonActive: {
    backgroundColor: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryOverlay,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    gap: 10,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  infoBold: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: Colors.primary,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Rounded.xxl,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: Colors.primary,
    borderRadius: Rounded.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
