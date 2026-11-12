import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, text, radius, spacing, makeStyles } from '../theme';

export const EmptyState = ({ title, message, onRetry, retryLabel = 'Try Again' }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>{retryLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = makeStyles({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: 12,
  },
  title: {
    ...text.h5,
  },
  message: {
    ...text.bodyMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  buttonText: {
    ...text.button,
  },
});
