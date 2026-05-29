import React, { useState, useCallback } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  Switch, Alert, TextInput, Image, Modal, FlatList, Linking 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Rounded } from '../theme';
import ProgressBar from '../components/ProgressBar';
import QUESTIONS from '../data/questions';
import {
  getUserName, saveUserName, getTotalStats, getBestStreak, getCurrentStreak,
  getNotificationSettingsComplex, saveNotificationSettingsComplex,
  getProfileImage, saveProfileImage, getQuestionHistory
} from '../services/storage';
import {
  requestNotificationPermissions, scheduleStudyReminder, scheduleDailyStudyReminder, cancelAllReminders
} from '../services/notifications';

const INTERVAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
const DAILY_HOUR_OPTIONS = [
  { label: '07:00 AM', hour: 7, minute: 0 },
  { label: '08:00 AM', hour: 8, minute: 0 },
  { label: '09:00 AM', hour: 9, minute: 0 },
  { label: '10:00 AM', hour: 10, minute: 0 },
  { label: '12:00 PM', hour: 12, minute: 0 },
  { label: '02:00 PM', hour: 14, minute: 0 },
  { label: '04:00 PM', hour: 16, minute: 0 },
  { label: '06:00 PM', hour: 18, minute: 0 },
  { label: '08:00 PM', hour: 20, minute: 0 },
  { label: '09:00 PM', hour: 21, minute: 0 },
  { label: '10:00 PM', hour: 22, minute: 0 },
];

const PRESET_AVATARS = [
  { id: 'avatar_brain', emoji: '🧠', color: '#5C59CE', name: 'Mente Activa' },
  { id: 'avatar_laptop', emoji: '💻', color: '#131370', name: 'Desarrollador' },
  { id: 'avatar_rocket', emoji: '🚀', color: '#E65100', name: 'Despegue' },
  { id: 'avatar_grad', emoji: '🎓', color: '#2E7D32', name: 'Graduado' },
  { id: 'avatar_fire', emoji: '🔥', color: '#FAC70F', name: 'Racha' },
  { id: 'avatar_star', emoji: '⭐', color: '#006064', name: 'Estrella' },
];

export default function ProfileScreen() {
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  
  const [stats, setStats] = useState({ totalAnswered: 0, totalCorrect: 0 });
  const [masteredCount, setMasteredCount] = useState(0);
  const [globalPrecision, setGlobalPrecision] = useState('0.0');
  
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  // Notification States
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifType, setNotifType] = useState('interval'); // 'interval' | 'daily'
  const [intervalHours, setIntervalHours] = useState(4);
  const [dailyHour, setDailyHour] = useState(9);
  const [dailyMinute, setDailyMinute] = useState(0);
  
  // Profile Picture States
  const [profilePic, setProfilePic] = useState(null); // Uri or Preset ID
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const loadAll = async () => {
    const name = await getUserName();
    const nameStr = name || 'Estudiante';
    setUserName(nameStr);
    setNameInput(nameStr);
    
    const s = await getTotalStats();
    setStats(s);
    
    // Mastered questions calculation (questions at 100% correct in history)
    const history = await getQuestionHistory();
    const totalQuestions = QUESTIONS.length || 400;
    const mastered = Object.values(history).filter(attempts => {
      return attempts.length > 0 && attempts.every(x => x === true);
    }).length;
    setMasteredCount(mastered);
    const precisionVal = totalQuestions > 0 ? ((mastered / totalQuestions) * 100).toFixed(1) : '0.0';
    setGlobalPrecision(precisionVal);
    
    const best = await getBestStreak();
    setBestStreak(best);
    
    const curr = await getCurrentStreak();
    setCurrentStreak(curr);
    
    // Notifications Configuration
    const notifSettings = await getNotificationSettingsComplex();
    setNotificationsEnabled(notifSettings.enabled);
    setNotifType(notifSettings.type || 'interval');
    setIntervalHours(notifSettings.intervalHours || 4);
    setDailyHour(notifSettings.dailyHour !== undefined ? notifSettings.dailyHour : 9);
    setDailyMinute(notifSettings.dailyMinute !== undefined ? notifSettings.dailyMinute : 0);
    
    // Profile Pic
    const pic = await getProfileImage();
    setProfilePic(pic);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      Alert.alert('Error', 'El nombre no puede estar vacío.');
      return;
    }
    await saveUserName(trimmed);
    setUserName(trimmed);
    setIsEditingName(false);
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
      
      // Reschedule according to selected type
      if (notifType === 'interval') {
        await scheduleStudyReminder(intervalHours);
      } else {
        await scheduleDailyStudyReminder(dailyHour, dailyMinute);
      }
    } else {
      await cancelAllReminders();
    }
    
    setNotificationsEnabled(value);
    await saveNotificationSettingsComplex({
      enabled: value,
      type: notifType,
      intervalHours,
      dailyHour,
      dailyMinute
    });
  };

  const handleNotifTypeChange = async (type) => {
    setNotifType(type);
    const updatedSettings = {
      enabled: notificationsEnabled,
      type,
      intervalHours,
      dailyHour,
      dailyMinute
    };
    await saveNotificationSettingsComplex(updatedSettings);
    
    if (notificationsEnabled) {
      if (type === 'interval') {
        await scheduleStudyReminder(intervalHours);
      } else {
        await scheduleDailyStudyReminder(dailyHour, dailyMinute);
      }
    }
  };

  const handleIntervalChange = async (hours) => {
    setIntervalHours(hours);
    const updatedSettings = {
      enabled: notificationsEnabled,
      type: 'interval',
      intervalHours: hours,
      dailyHour,
      dailyMinute
    };
    await saveNotificationSettingsComplex(updatedSettings);
    
    if (notificationsEnabled) {
      await scheduleStudyReminder(hours);
    }
  };

  const handleDailyTimeChange = async (h, m) => {
    setDailyHour(h);
    setDailyMinute(m);
    const updatedSettings = {
      enabled: notificationsEnabled,
      type: 'daily',
      intervalHours,
      dailyHour: h,
      dailyMinute: m
    };
    await saveNotificationSettingsComplex(updatedSettings);
    
    if (notificationsEnabled) {
      await scheduleDailyStudyReminder(h, m);
    }
  };

  const handlePickGallery = async () => {
    setShowPhotoModal(false);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos de galería para cambiar tu foto.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      await saveProfileImage(selectedUri);
      setProfilePic(selectedUri);
    }
  };

  const handleSelectPreset = async (presetId) => {
    setShowPhotoModal(false);
    await saveProfileImage(presetId);
    setProfilePic(presetId);
  };

  const handleRemovePhoto = async () => {
    setShowPhotoModal(false);
    await saveProfileImage(null);
    setProfilePic(null);
  };

  // Render the current profile picture
  const renderAvatar = () => {
    if (!profilePic) {
      return (
        <View style={[styles.avatarCircle, { backgroundColor: Colors.primary }]}>
          <Ionicons name="person" size={40} color={Colors.white} />
        </View>
      );
    }
    
    // Check if it is a preset avatar id
    if (profilePic.startsWith('avatar_')) {
      const preset = PRESET_AVATARS.find(a => a.id === profilePic);
      if (preset) {
        return (
          <View style={[styles.avatarCircle, { backgroundColor: preset.color }]}>
            <Text style={styles.avatarEmoji}>{preset.emoji}</Text>
          </View>
        );
      }
    }
    
    // Otherwise it's a device file URI
    return (
      <Image source={{ uri: profilePic }} style={styles.avatarImage} />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarWrapper} 
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.8}
          >
            {renderAvatar()}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>

          <View style={styles.nameRow}>
            {isEditingName ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  maxLength={20}
                  autoFocus
                  onSubmitEditing={handleSaveName}
                />
                <TouchableOpacity style={styles.editSaveBtn} onPress={handleSaveName}>
                  <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameDisplayContainer}>
                <Text style={styles.userName}>{userName}</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditingName(true)}>
                  <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Text style={styles.userSubtitle}>Toca la foto para cambiar de avatar</Text>
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
            <Text style={[styles.statNumber, { color: Colors.primary }]}>{masteredCount}</Text>
            <Text style={styles.statLabel}>Preguntas al 100%</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: Colors.secondary }]}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Mejor racha</Text>
          </View>
        </View>

        {/* Mastered Accuracy Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Precisión Global (Masterizadas)</Text>
              <Text style={styles.progressSubtitle}>Preguntas al 100% de la base de datos (400)</Text>
            </View>
            <Text style={styles.progressValue}>{globalPrecision}%</Text>
          </View>
          <ProgressBar
            progress={QUESTIONS.length > 0 ? masteredCount / QUESTIONS.length : 0}
            height={10}
            color={Colors.primary}
          />
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Recordatorios de Estudio</Text>

        <View style={styles.notifCard}>
          <View style={styles.notifRow}>
            <View style={styles.notifIconContainer}>
              <Ionicons 
                name={notificationsEnabled ? "notifications" : "notifications-off"} 
                size={22} 
                color={Colors.primary} 
              />
            </View>
            <View style={styles.notifTextContainer}>
              <Text style={styles.notifTitle}>Recordatorios activos</Text>
              <Text style={styles.notifSubtitle}>
                {notificationsEnabled
                  ? (notifType === 'interval' 
                      ? `Cada ${intervalHours} hora${intervalHours > 1 ? 's' : ''}` 
                      : `Todos los días a las ${dailyHour.toString().padStart(2, '0')}:${dailyMinute.toString().padStart(2, '0')}`)
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
            <View style={styles.notifConfigSection}>
              {/* Type Switcher */}
              <View style={styles.typeSwitcher}>
                <TouchableOpacity 
                  style={[styles.typeBtn, notifType === 'interval' && styles.typeBtnActive]}
                  onPress={() => handleNotifTypeChange('interval')}
                >
                  <Text style={[styles.typeBtnText, notifType === 'interval' && styles.typeBtnTextActive]}>
                    Por Intervalo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, notifType === 'daily' && styles.typeBtnActive]}
                  onPress={() => handleNotifTypeChange('daily')}
                >
                  <Text style={[styles.typeBtnText, notifType === 'daily' && styles.typeBtnTextActive]}>
                    Hora Fija Diaria
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Interval Configurations */}
              {notifType === 'interval' ? (
                <View style={styles.configArea}>
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
              ) : (
                /* Daily Fixed Time Configurations */
                <View style={styles.configArea}>
                  <Text style={styles.intervalLabel}>Elegir hora de estudio:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dailyOptions}>
                    {DAILY_HOUR_OPTIONS.map((opt) => {
                      const isActive = dailyHour === opt.hour && dailyMinute === opt.minute;
                      return (
                        <TouchableOpacity
                          key={opt.label}
                          style={[
                            styles.dailyBtn,
                            isActive && styles.dailyBtnActive,
                          ]}
                          onPress={() => handleDailyTimeChange(opt.hour, opt.minute)}
                        >
                          <Text style={[
                            styles.dailyBtnText,
                            isActive && styles.dailyBtnTextActive,
                          ]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Current Streak */}
        <View style={styles.streakCard}>
          <Ionicons name="flame" size={28} color={Colors.secondary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.streakNumber}>{currentStreak} días</Text>
            <Text style={styles.streakLabel}>Racha actual de estudio</Text>
          </View>
        </View>

        {/* Creator Info / Credits */}
        <View style={styles.creditsSeparator} />
        <View style={styles.creditsContainer}>
          <Text style={styles.creditsLabel}>CREADOR</Text>
          <Text style={styles.creditsName}>Alex Murillo</Text>
          
          <TouchableOpacity 
            style={styles.githubBtn} 
            onPress={() => Linking.openURL('https://github.com/withoul2/SimuladorComplex')}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-github" size={18} color={Colors.white} />
            <Text style={styles.githubBtnText}>Ver en GitHub</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Profile Picture Change Modal */}
      <Modal visible={showPhotoModal} transparent animationType="slide" onRequestClose={() => setShowPhotoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Foto de Perfil</Text>
            
            {/* Options grid */}
            <Text style={styles.modalSubtitle}>Elige un Avatar Ilustrado:</Text>
            <View style={styles.avatarGrid}>
              {PRESET_AVATARS.map((avatar) => (
                <TouchableOpacity 
                  key={avatar.id}
                  style={[styles.presetAvatarBox, { backgroundColor: avatar.color }]}
                  onPress={() => handleSelectPreset(avatar.id)}
                >
                  <Text style={styles.presetAvatarEmoji}>{avatar.emoji}</Text>
                  <Text style={styles.presetAvatarName}>{avatar.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            {/* Custom Picture Buttons */}
            <TouchableOpacity style={styles.actionModalBtn} onPress={handlePickGallery}>
              <Ionicons name="images-outline" size={20} color={Colors.primary} />
              <Text style={styles.actionModalBtnText}>Subir foto desde Galería</Text>
            </TouchableOpacity>

            {profilePic && (
              <TouchableOpacity style={[styles.actionModalBtn, styles.removeBtn]} onPress={handleRemovePhoto}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                <Text style={[styles.actionModalBtnText, { color: Colors.error }]}>Eliminar foto actual</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowPhotoModal(false)}>
              <Text style={styles.closeModalBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarEmoji: {
    fontSize: 42,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  nameDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  editBtn: {
    padding: 4,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderColor: Colors.primary,
    width: '70%',
  },
  nameInput: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: 4,
  },
  editSaveBtn: {
    marginLeft: 8,
  },
  userSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
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
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  progressSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  progressValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  notifCard: {
    backgroundColor: Colors.white,
    borderRadius: Rounded.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: Spacing.xl,
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
  notifConfigSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Rounded.lg,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Rounded.md,
  },
  typeBtnActive: {
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  typeBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  typeBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  configArea: {
    animationType: 'fade',
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
    color: Colors.textSecondary,
  },
  intervalBtnTextActive: {
    color: Colors.white,
  },
  dailyOptions: {
    gap: 8,
    paddingVertical: 4,
  },
  dailyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Rounded.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.white,
  },
  dailyBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dailyBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dailyBtnTextActive: {
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
  // Modal Styles
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
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  presetAvatarBox: {
    width: 90,
    height: 72,
    borderRadius: Rounded.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  presetAvatarEmoji: {
    fontSize: 28,
  },
  presetAvatarName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: Colors.white,
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    marginVertical: Spacing.md,
  },
  actionModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: Rounded.lg,
    backgroundColor: Colors.surfaceContainerLow,
    marginBottom: Spacing.sm,
  },
  actionModalBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  removeBtn: {
    backgroundColor: 'rgba(186, 26, 26, 0.08)',
  },
  closeModalBtn: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeModalBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  creditsSeparator: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    marginVertical: Spacing.xxl,
  },
  creditsContainer: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    gap: 4,
  },
  creditsLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1.5,
  },
  creditsName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  githubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1B1B', // Dark slate for GitHub style
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
    borderRadius: Rounded.full,
    gap: 8,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  githubBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.white,
    fontWeight: '600',
  },
});
