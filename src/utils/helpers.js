/**
 * Shuffle an array in-place using Fisher-Yates algorithm
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Select N random questions from the pool
 */
export function selectRandomQuestions(questions, count) {
  const n = Math.min(count, questions.length);
  const shuffled = shuffleArray(questions);
  return shuffled.slice(0, n);
}

/**
 * Prepare a question for display by shuffling its options
 * Returns the question with shuffled options and the index of the correct answer
 */
export function prepareQuestion(question) {
  const shuffledOptions = shuffleArray(question.opciones);
  const correctIndex = shuffledOptions.indexOf(question.respuestaCorrecta);
  return {
    ...question,
    shuffledOptions,
    correctIndex,
  };
}

/**
 * Format time in seconds to mm:ss
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get month name in Spanish
 */
export function getMonthName(month) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return months[month];
}

/**
 * Get day names in Spanish (short)
 */
export function getDayNames() {
  return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the day of the week for the first day of the month (0 = Monday)
 */
export function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Monday-first format
}
