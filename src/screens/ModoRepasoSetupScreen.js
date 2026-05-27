import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';
import QUESTIONS from '../data/questions';

export default function ModoRepasoSetupScreen({ navigation }) {
  const [startIdx, setStartIdx] = useState('1');
  const [endIdx, setEndIdx] = useState('50');

  const handleStart = () => {
    const start = parseInt(startIdx);
    const end = parseInt(endIdx);
    const max = QUESTIONS.length;

    if (isNaN(start) || isNaN(end) || start < 1 || end > max || start > end) {
      Alert.alert('Rango inválido', `Por favor ingresa un rango válido entre 1 y ${max}.`);
      return;
    }

    // Pass the range to the study screen
    navigation.navigate('ModoRepasoStudy', { start, end });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.setupContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backArrow}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.setupIconContainer}>
          <Ionicons name="book-outline" size={48} color={Colors.primary} />
        </View>

        <Text style={styles.setupTitle}>Estudio por Temario</Text>
        <Text style={styles.setupSubtitle}>
          Selecciona el rango de preguntas que deseas repasar antes del simulacro.
        </Text>

        <View style={styles.rangeContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Desde:</Text>
            <TextInput
              style={styles.customInput}
              keyboardType="number-pad"
              value={startIdx}
              onChangeText={(t) => setStartIdx(t.replace(/[^0-9]/g, ''))}
              maxLength={3}
            />
          </View>
          <Text style={styles.rangeDivider}>-</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hasta:</Text>
            <TextInput
              style={styles.customInput}
              keyboardType="number-pad"
              value={endIdx}
              onChangeText={(t) => setEndIdx(t.replace(/[^0-9]/g, ''))}
              maxLength={3}
            />
          </View>
        </View>
        <Text style={styles.maxText}>Máximo disponible: {QUESTIONS.length}</Text>

        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Ionicons name="eye-outline" size={20} color={Colors.white} />
          <Text style={styles.startButtonText}>Repasar Preguntas</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 40,
  },
  setupContainer: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  backArrow: {
    position: 'absolute',
    top: 20,
    left: Spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  setupTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  setupSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 22,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  inputGroup: {
    alignItems: 'center',
    width: 100,
  },
  inputLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  customInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: Rounded.lg,
    padding: Spacing.md,
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    backgroundColor: Colors.white,
  },
  rangeDivider: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.md,
    marginTop: 24, // to align with input box
  },
  maxText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Rounded.lg,
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});
