import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { colors, text, radius, makeStyles } from '../theme';

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

const styles = makeStyles({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
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
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: radius.sm,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: radius.sm,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    ...text.h4,
    marginBottom: 4,
  },
  category: {
    ...text.bodyMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tax: {
    fontFamily: text.label.fontFamily,
    fontWeight: '500',
    fontSize: 12,
    color: colors.primary,
  },
  active: {
    fontFamily: text.label.fontFamily,
    fontWeight: '500',
    fontSize: 12,
    color: colors.success,
  },
});
