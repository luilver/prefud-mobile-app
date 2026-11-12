import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/api';
import { ENDPOINTS, ORDER_STATUSES } from '../api/endpoints';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { colors, text, radius, spacing, makeStyles } from '../theme';

export default function DeliveryBoyScreen({ navigation }) {
  const { logout, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignedOrders = async () => {
    try {
      const data = await api.get(ENDPOINTS.orders.orders);
      // Show orders available for this delivery boy to accept:
      // unassigned (delivererId === null) or already assigned to this user
      const available = (data || []).filter(
        (o) => o.delivererId === null || o.delivererId === user?.id || o.delivererId === user?.username
      );
      setOrders(available);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchAssignedOrders();
    })();
  }, []);

  const acceptOrder = async (order) => {
    try {
      await Alert.alert(
        'Aceptar pedido',
        `¿Aceptas el pedido #${order.id?.slice(0, 8)}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Aceptar',
            onPress: async () => {
              try {
                // Transition order from CREATED to PAID and assign this deliverer
                const delivererId = user?.id || user?.username;
                await api.patch(ENDPOINTS.orders.orderStatus(order.id), {
                  status: ORDER_STATUSES.PAID,
                  delivererId,
                });
                const updated = { ...order, status: ORDER_STATUSES.PAID, delivererId };
                navigation.navigate('DeliveryMap', { order: updated });
              } catch (err) {
                Alert.alert('Error', err.message || 'No se pudo aceptar el pedido');
              }
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => acceptOrder(item)}>
      <Text style={styles.orderId}>Pedido #{item.id?.slice(0, 8) || 'N/A'}</Text>
      <Text style={styles.orderMarket}>
        {item.market || item.marketName || 'Mercado N/A'}
      </Text>
      <Text style={styles.orderStatus}>{item.status || 'Sin estado'}</Text>
      <Text style={styles.acceptHint}>Toca para aceptar y abrir el mapa</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos asignados</Text>
        <Text style={styles.subtitle}>Delivery Boy</Text>
        <TouchableOpacity style={styles.signout} onPress={logout}>
          <Text style={styles.signoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Loading message="Cargando pedidos..." />
      ) : error ? (
        <EmptyState title="Error al cargar" message={error} onRetry={fetchAssignedOrders} />
      ) : orders.length === 0 ? (
        <EmptyState title="Sin pedidos asignados" message="No hay pedidos pendientes para aceptar." />
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
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
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
    marginBottom: 4,
  },
  orderStatus: {
    ...text.bodyMuted,
    fontSize: 13,
    color: colors.accent,
    marginBottom: 6,
  },
  acceptHint: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: 'italic',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 20,
  },
});
