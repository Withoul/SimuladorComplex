import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Rounded } from '../theme';

export default function ProgressBar({ progress, height = 8, color = Colors.secondary }) {
  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(progress * 100, 100)}%`,
            height,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Rounded.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Rounded.full,
  },
});
