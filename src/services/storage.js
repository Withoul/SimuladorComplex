import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_NAME: '@simulador_user_name',
  STUDY_DAYS: '@simulador_study_days',
  CURRENT_STREAK: '@simulador_current_streak',
  BEST_STREAK: '@simulador_best_streak',
  POINTS_TODAY: '@simulador_points_today',
  POINTS_DATE: '@simulador_points_date',
  TOTAL_ANSWERED: '@simulador_total_answered',
  TOTAL_CORRECT: '@simulador_total_correct',
  NOTIFICATION_INTERVAL: '@simulador_notification_interval',
  NOTIFICATIONS_ENABLED: '@simulador_notifications_enabled',
  QUESTION_HISTORY: '@simulador_question_history',
  STUDY_TIME: '@simulador_study_time',
  COMPLEX_EXAM_DATE: '@simulador_complex_exam_date',
  PROFILE_IMAGE: '@simulador_profile_image',
  NOTIFICATION_SETTINGS_COMPLEX: '@simulador_notification_settings_complex',
};

// User Name
export const saveUserName = async (name) => {
  await AsyncStorage.setItem(KEYS.USER_NAME, name);
};

export const getUserName = async () => {
  return await AsyncStorage.getItem(KEYS.USER_NAME);
};

// Study Days (stored as JSON array of date strings "YYYY-MM-DD")
export const getStudyDays = async () => {
  const data = await AsyncStorage.getItem(KEYS.STUDY_DAYS);
  return data ? JSON.parse(data) : [];
};

export const markStudyDay = async (date = null) => {
  const today = date || new Date().toISOString().split('T')[0];
  const days = await getStudyDays();
  if (!days.includes(today)) {
    days.push(today);
    await AsyncStorage.setItem(KEYS.STUDY_DAYS, JSON.stringify(days));
  }
  return days;
};

// Streak
export const getCurrentStreak = async () => {
  const streak = await AsyncStorage.getItem(KEYS.CURRENT_STREAK);
  return streak ? parseInt(streak) : 0;
};

export const getBestStreak = async () => {
  const streak = await AsyncStorage.getItem(KEYS.BEST_STREAK);
  return streak ? parseInt(streak) : 0;
};

export const updateStreak = async () => {
  const days = await getStudyDays();
  if (days.length === 0) return { current: 0, best: 0 };

  // Sort days
  const sorted = [...days].sort();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Calculate current streak
  let currentStreak = 0;
  if (sorted.includes(today) || sorted.includes(yesterday)) {
    currentStreak = 1;
    let checkDate = sorted.includes(today) ? today : yesterday;
    
    for (let i = 1; i < 365; i++) {
      const prevDate = new Date(new Date(checkDate).getTime() - i * 86400000)
        .toISOString().split('T')[0];
      if (sorted.includes(prevDate)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  await AsyncStorage.setItem(KEYS.CURRENT_STREAK, currentStreak.toString());

  const bestStreak = await getBestStreak();
  if (currentStreak > bestStreak) {
    await AsyncStorage.setItem(KEYS.BEST_STREAK, currentStreak.toString());
  }

  return {
    current: currentStreak,
    best: Math.max(currentStreak, bestStreak),
  };
};

// Points Today
export const getPointsToday = async () => {
  const date = await AsyncStorage.getItem(KEYS.POINTS_DATE);
  const today = new Date().toISOString().split('T')[0];
  
  if (date !== today) {
    await AsyncStorage.setItem(KEYS.POINTS_DATE, today);
    await AsyncStorage.setItem(KEYS.POINTS_TODAY, '0');
    return 0;
  }
  
  const points = await AsyncStorage.getItem(KEYS.POINTS_TODAY);
  return points ? parseInt(points) : 0;
};

export const addPoints = async (amount) => {
  const current = await getPointsToday();
  const newPoints = current + amount;
  const today = new Date().toISOString().split('T')[0];
  await AsyncStorage.setItem(KEYS.POINTS_DATE, today);
  await AsyncStorage.setItem(KEYS.POINTS_TODAY, newPoints.toString());
  return newPoints;
};

// Stats
export const getTotalStats = async () => {
  const answered = await AsyncStorage.getItem(KEYS.TOTAL_ANSWERED);
  const correct = await AsyncStorage.getItem(KEYS.TOTAL_CORRECT);
  return {
    totalAnswered: answered ? parseInt(answered) : 0,
    totalCorrect: correct ? parseInt(correct) : 0,
  };
};

export const addToStats = async (answered, correct) => {
  const stats = await getTotalStats();
  const newAnswered = stats.totalAnswered + answered;
  const newCorrect = stats.totalCorrect + correct;
  await AsyncStorage.setItem(KEYS.TOTAL_ANSWERED, newAnswered.toString());
  await AsyncStorage.setItem(KEYS.TOTAL_CORRECT, newCorrect.toString());
  return { totalAnswered: newAnswered, totalCorrect: newCorrect };
};

// Notifications Settings
export const getNotificationSettings = async () => {
  const enabled = await AsyncStorage.getItem(KEYS.NOTIFICATIONS_ENABLED);
  const interval = await AsyncStorage.getItem(KEYS.NOTIFICATION_INTERVAL);
  return {
    enabled: enabled === null ? false : enabled === 'true',
    intervalHours: interval ? parseInt(interval) : 4,
  };
};

export const saveNotificationSettings = async (enabled, intervalHours) => {
  await AsyncStorage.setItem(KEYS.NOTIFICATIONS_ENABLED, enabled.toString());
  await AsyncStorage.setItem(KEYS.NOTIFICATION_INTERVAL, intervalHours.toString());
};

// Question History per Question (saves last 10 attempts)
export const getQuestionHistory = async () => {
  const data = await AsyncStorage.getItem(KEYS.QUESTION_HISTORY);
  return data ? JSON.parse(data) : {};
};

export const recordQuestionAnswer = async (questionId, isCorrect) => {
  const history = await getQuestionHistory();
  const qHistory = history[questionId] || [];
  qHistory.push(isCorrect);
  let updatedHistory;
  if (qHistory.length > 10) {
    updatedHistory = qHistory.slice(-10);
  } else {
    updatedHistory = qHistory;
  }
  history[questionId] = updatedHistory;
  await AsyncStorage.setItem(KEYS.QUESTION_HISTORY, JSON.stringify(history));
  return history;
};

// Study Time Tracking (foreground study time in seconds per day)
export const getStudyTime = async () => {
  const data = await AsyncStorage.getItem(KEYS.STUDY_TIME);
  return data ? JSON.parse(data) : {};
};

export const addStudyTime = async (seconds) => {
  const today = new Date().toISOString().split('T')[0];
  const timeData = await getStudyTime();
  timeData[today] = (timeData[today] || 0) + seconds;
  await AsyncStorage.setItem(KEYS.STUDY_TIME, JSON.stringify(timeData));
  return timeData;
};

// Complex Exam Date (stored as "YYYY-MM-DD")
export const getComplexExamDate = async () => {
  return await AsyncStorage.getItem(KEYS.COMPLEX_EXAM_DATE);
};

export const saveComplexExamDate = async (date) => {
  if (date) {
    await AsyncStorage.setItem(KEYS.COMPLEX_EXAM_DATE, date);
  } else {
    await AsyncStorage.removeItem(KEYS.COMPLEX_EXAM_DATE);
  }
};

// Profile Image (Base64 URI or local image path)
export const getProfileImage = async () => {
  return await AsyncStorage.getItem(KEYS.PROFILE_IMAGE);
};

export const saveProfileImage = async (imageUri) => {
  if (imageUri) {
    await AsyncStorage.setItem(KEYS.PROFILE_IMAGE, imageUri);
  } else {
    await AsyncStorage.removeItem(KEYS.PROFILE_IMAGE);
  }
};

// Advanced Notification Settings
export const getNotificationSettingsComplex = async () => {
  const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_SETTINGS_COMPLEX);
  if (data) {
    return JSON.parse(data);
  }
  // Default legacy settings compatibility
  const legacy = await getNotificationSettings();
  return {
    enabled: legacy.enabled,
    type: 'interval', // 'interval' | 'daily'
    intervalHours: legacy.intervalHours,
    dailyHour: 9,
    dailyMinute: 0,
  };
};

export const saveNotificationSettingsComplex = async (settings) => {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_SETTINGS_COMPLEX, JSON.stringify(settings));
  // Keep legacy settings synced for safety/backward compatibility
  await saveNotificationSettings(settings.enabled, settings.intervalHours || 4);
};
