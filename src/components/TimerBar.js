import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Rounded } from '../theme';

export default function TimerBar({ timeLeft, totalTime }) {
  const animValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const progress = timeLeft / totalTime;
    Animated.timing(animValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, totalTime]);

  const getColor = () => {
    const ratio = timeLeft / totalTime;
    if (ratio > 0.5) return Colors.success;
    if (ratio > 0.25) return Colors.secondary;
    return Colors.error;
  };

  const width = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>⏱️ Tiempo</Text>
        <Text style={[styles.time, timeLeft <= 5 && styles.timeUrgent]}>
          {timeLeft}s
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width,
              backgroundColor: getColor(),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  time: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timeUrgent: {
    color: Colors.error,
  },
  track: {
    height: 8,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Rounded.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Rounded.full,
  },
});
