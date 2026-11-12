import React from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, text, radius, spacing, makeStyles } from '../theme';

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Detalle del pedido</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contenido</Text>
        <Text style={styles.body}>
          {order?.items?.map((item) => `- ${item.name} (x${item.qty})`).join('\n') ||
            'Sin ítems disponibles'}
        </Text>

        <Text style={styles.sectionTitle}>Lugar de recogida</Text>
        <Text style={styles.body}>
          {order?.pickupAddress || order?.pickup?.address || 'No especificada'}
        </Text>

        <Text style={styles.sectionTitle}>Lugar de entrega</Text>
        <Text style={styles.body}>
          {order?.deliveryAddress || order?.delivery?.address || 'No especificada'}
        </Text>

        <View style={styles.coordsRow}>
          <View style={styles.coordBox}>
            <Text style={styles.coordLabel}>Recogida</Text>
            <Text style={styles.coordValue}>
              {order?.pickupLat != null && order?.pickupLng != null
                ? `${order.pickupLat}, ${order.pickupLng}`
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.coordBox}>
            <Text style={styles.coordLabel}>Entrega</Text>
            <Text style={styles.coordValue}>
              {order?.deliveryLat != null && order?.deliveryLng != null
                ? `${order.deliveryLat}, ${order.deliveryLng}`
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Estado</Text>
        <Text style={styles.currentStatus}>{order?.status || 'Sin estado'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = makeStyles({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: 16,
  },
  back: {
    marginRight: 12,
  },
  backText: {
    fontSize: 20,
    color: colors.onBackground,
  },
  title: {
    ...text.h3,
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: text.label.fontFamily,
    fontWeight: '600',
    fontSize: 14,
    color: colors.muted,
    marginBottom: 6,
  },
  body: {
    ...text.body,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  coordBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 10,
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 4,
  },
  coordValue: {
    fontFamily: text.label.fontFamily,
    fontSize: 13,
    color: colors.onBackground,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  currentStatus: {
    ...text.body,
    fontSize: 16,
    color: colors.primary,
  },
});
