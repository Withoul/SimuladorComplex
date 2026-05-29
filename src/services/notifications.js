import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Linking, Alert } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIFICATION_IDENTIFIER = 'simulador-study-reminder';

const MOTIVATIONAL_MESSAGES = [
  '📚 ¡Es hora de estudiar! Cada pregunta te acerca más al éxito.',
  '🔥 ¡No pierdas tu racha! Abre SimuladorComplex y practica.',
  '💪 ¡Tú puedes! Una sesión de estudio te espera.',
  '🎯 ¡Mantén el enfoque! Practica tus preguntas hoy.',
  '⭐ ¡Los campeones practican todos los días! ¿Empezamos?',
  '📖 ¡La persistencia es el camino al éxito! Estudia ahora.',
  '🚀 ¡Supera tu récord de ayer! Abre tu simulador.',
  '🧠 ¡Tu cerebro te agradecerá esta sesión de estudio!',
];

export async function requestNotificationPermissions() {
  if (!Device.isDevice) {
    console.log('Notifications require a physical device');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permisos denegados',
      'Para recibir recordatorios, necesitas habilitar las notificaciones en la configuración de tu dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir Configuración', onPress: () => Linking.openSettings() }
      ]
    );
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('study-reminders', {
      name: 'Recordatorios de Estudio',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#441F6F',
    });
  }

  return true;
}

export async function scheduleStudyReminder(intervalHours = 4) {
  // Cancel any existing notifications first
  await cancelAllReminders();

  const randomMessage =
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

  // Schedule a repeating notification at the given interval (in seconds)
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SimuladorComplex',
      body: randomMessage,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: 'timeInterval',
      seconds: intervalHours * 3600,
      repeats: true,
    },
    identifier: NOTIFICATION_IDENTIFIER,
  });

  return identifier;
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleDailyStudyReminder(hour = 9, minute = 0) {
  await cancelAllReminders();
  
  const randomMessage =
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SimuladorComplex',
      body: randomMessage,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
    identifier: NOTIFICATION_IDENTIFIER,
  });

  return identifier;
}

export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
