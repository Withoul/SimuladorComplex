import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Rounded } from '../theme';

export default function ModeCard({ title, subtitle, iconName, iconBgColor, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor || Colors.primaryOverlay }]}>
        <Ionicons name={iconName} size={28} color={Colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={Colors.outlineVariant} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Rounded.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    elevation: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Rounded.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
