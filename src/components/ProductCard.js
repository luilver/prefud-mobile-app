import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

export const ProductCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.imageContainer}>
      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={styles.image} />
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
    <View style={styles.content}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category?.name || 'Uncategorized'}</Text>
      <View style={styles.row}>
        <Text style={styles.tax}>Tax: {item.tax?.name || 'N/A'}</Text>
        <Text style={styles.active}>{item.isActive ? 'Active' : 'Inactive'}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tax: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  active: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
});
