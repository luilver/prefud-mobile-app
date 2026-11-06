import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

export const RoleSelector = ({ onSelectRole }) => {
  const roles = [
    { id: 'Deliverer', label: 'Deliverer', icon: '🚚', color: '#3B82F6' },
    { id: 'Supervisor', label: 'Supervisor', icon: '👁️', color: '#8B5CF6' },
    { id: 'Logistic', label: 'Logistic', icon: '📦', color: '#EF4444' },
    { id: 'Provider', label: 'Provider', icon: '🏪', color: '#10B981' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>Choose your user type to access the dashboard</Text>
      </View>

      <View style={styles.grid}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[styles.card, { borderLeftWidth: 4, borderLeftColor: role.color }]}
            onPress={() => onSelectRole(role.id)}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{role.icon}</Text>
            </View>
            <Text style={styles.roleName}>{role.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});

export const Loading = ({ message = 'Loading...' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

const loadingStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 16,
  },
});
