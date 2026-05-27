import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Rounded } from '../theme';

export default function StatCard({ label, value, icon, color }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, color && { color }]}>{value}</Text>
        {icon && <Text style={styles.icon}>{icon}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Rounded.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  icon: {
    fontSize: 20,
    marginLeft: 6,
  },
});
