import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Alert, Picker,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/api';
import { ENDPOINTS, ORDER_STATUSES } from '../api/endpoints';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { colors, text, radius, spacing, makeStyles } from '../theme';

const STATUS_OPTIONS = [
  { value: ORDER_STATUSES.RECEIVED, label: 'Recibido' },
  { value: ORDER_STATUSES.PACKED, label: 'Recibido y armado el paquete' },
  { value: ORDER_STATUSES.DELIVERED_TO_BOY, label: 'Entregado al delivery boy' },
  { value: ORDER_STATUSES.CANCELLED, label: 'Cancelado' },
  { value: ORDER_STATUSES.LOST_INCIDENT, label: 'Perdido / Incidente' },
];

export default function SupervisorScreen({ navigation }) {
  const { logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});

  const fetchOrders = async () => {
    try {
      const data = await api.get(ENDPOINTS.orders.orders);
      setOrders(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchOrders();
    })();
  }, []);

  const updateStatus = async (order, newStatus) => {
    setUpdating({ ...updating, [order.id]: true });
    try {
      await api.patch(ENDPOINTS.orders.orderStatus(order.id), { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
      Alert.alert('Estado actualizado', `Pedido ${order.id?.slice(0, 8)}: ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo actualizar el estado');
    } finally {
      const next = { ...updating };
      delete next[order.id];
      setUpdating(next);
    }
  };

  const statusLabel = (status) => {
    const found = STATUS_OPTIONS.find((s) => s.value === status);
    return found ? found.label : status || 'Sin estado';
  };

  const renderItem = ({ item }) => {
    const isUpdating = updating[item.id];
    return (
      <TouchableOpacity style={styles.card} key={item.id}>
        <Text style={styles.orderId}>Pedido #{item.id?.slice(0, 8) || 'N/A'}</Text>
        <Text style={styles.orderMarket}>
          {item.market || item.marketName || 'Mercado N/A'}
        </Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{statusLabel(item.status)}</Text>
          <Picker
            style={styles.picker}
            selectedValue={item.status}
            onValueChange={(value) => updateStatus(item, value)}
            enabled={!isUpdating}
          >
            {STATUS_OPTIONS.map((s) => (
              <Picker.Item key={s.value} label={s.label} value={s.value} />
            ))}
          </Picker>
        </View>
        {isUpdating && <Text style={styles.updating}>Actualizando…</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos — Supervisor</Text>
        <Text style={styles.subtitle}>Centro de Acoque</Text>
        <TouchableOpacity style={styles.signout} onPress={logout}>
          <Text style={styles.signoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Loading message="Cargando pedidos..." />
      ) : error ? (
        <EmptyState title="Error al cargar" message={error} onRetry={fetchOrders} />
      ) : orders.length === 0 ? (
        <EmptyState title="Sin pedidos" message="No hay pedidos para gestionar." />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = makeStyles({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    marginBottom: 16,
  },
  title: {
    ...text.h3,
  },
  subtitle: {
    ...text.bodyMuted,
    fontSize: 14,
    marginTop: 4,
  },
  signout: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginLeft: spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.error,
    borderRadius: radius.lg,
  },
  signoutText: {
    ...text.button,
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginHorizontal: spacing.md,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  orderId: {
    fontFamily: text.label.fontFamily,
    fontWeight: '600',
    fontSize: 16,
    color: colors.onBackground,
    marginBottom: 4,
  },
  orderMarket: {
    ...text.bodyMuted,
    fontSize: 14,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusLabel: {
    ...text.body,
    fontSize: 14,
    color: colors.primary,
    flex: 1,
  },
  picker: {
    flex: 1,
    color: colors.onBackground,
  },
  updating: {
    ...text.bodyMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 20,
  },
});
