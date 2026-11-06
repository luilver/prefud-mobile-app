import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const Loading = ({ message = 'Loading...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    color: '#64748B',
    fontSize: 16,
  },
});
