import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Alert,
  TextInput, Picker,
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

export default function CentroAcoqueScreen({ navigation }) {
  const { logout, user } = useAuth();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const marketId = user?.marketId || user?.market || 'default-market';

  const fetchData = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([
        api.get(ENDPOINTS.orders.orders),
        api.get(ENDPOINTS.catalog.products),
      ]);
      setOrders(ordersData || []);
      setProducts(productsData || []);
      setStock((productsData || []).map((p) => ({ ...p, qty: p.stockQty ?? 0 })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  const updateOrderStatus = async (order, newStatus) => {
    try {
      await api.patch(ENDPOINTS.orders.orderStatus(order.id), { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo actualizar el estado');
    }
  };

  const cancelOrder = async (order) => {
    try {
      await api.patch(ENDPOINTS.orders.orderStatus(order.id), {
        status: ORDER_STATUSES.CANCELLED,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'cancelado' } : o))
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo cancelar el pedido');
    }
  };

  const updateStock = async (product, newQty) => {
    try {
      await api.patch(ENDPOINTS.catalog.productById(product.id), {
        stockQty: newQty,
        marketId,
      });
      setStock((prev) =>
        prev.map((s) => (s.id === product.id ? { ...s, qty: newQty } : s))
      );
      Alert.alert('Stock actualizado', `Producto ${product.name}: ${newQty}`);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo actualizar el stock');
    }
  };

  const addProduct = async () => {
    const name = prompt('Nombre del producto');
    if (!name) return;
    const price = prompt('Precio');
    if (!price) return;
    try {
      await api.post(ENDPOINTS.catalog.products, {
        name,
        price: Number(price),
        marketId,
        stockQty: 0,
      });
      Alert.alert('Producto agregado');
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo agregar el producto');
    }
  };

  const statusLabel = (status) => {
    const found = STATUS_OPTIONS.find((s) => s.value === status);
    return found ? found.label : status || 'Sin estado';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <Loading message="Cargando..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Text style={styles.title}>Centro de Acoque</Text>
        <Text style={styles.subtitle}>Mercado: {marketId}</Text>
        <TouchableOpacity style={styles.signout} onPress={logout}>
          <Text style={styles.signoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'orders' && styles.tabActive]}
          onPress={() => setTab('orders')}
        >
          <Text style={[styles.tabText, tab === 'orders' && styles.tabTextActive]}>
            Pedidos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'stock' && styles.tabActive]}
          onPress={() => setTab('stock')}
        >
          <Text style={[styles.tabText, tab === 'stock' && styles.tabTextActive]}>
            Stock
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'orders' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pedidos</Text>
          {orders.length === 0 ? (
            <EmptyState title="Sin pedidos" message="No hay pedidos para gestionar." />
          ) : (
            <FlatList
              data={orders}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.card} key={item.id}>
                  <Text style={styles.orderId}>Pedido #{item.id?.slice(0, 8) || 'N/A'}</Text>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>{statusLabel(item.status)}</Text>
                    <Picker
                      style={styles.picker}
                      selectedValue={item.status}
                      onValueChange={(value) => updateOrderStatus(item, value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <Picker.Item key={s.value} label={s.label} value={s.value} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => cancelOrder(item)}
                    >
                      <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock — Mercado {marketId}</Text>
          {stock.length === 0 ? (
            <EmptyState title="Sin productos" message="No hay productos en este mercado." />
          ) : (
            <FlatList
              data={stock}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.card} key={item.id}>
                  <View style={styles.productRow}>
                    <View>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productPrice}>
                        ${(item.price || 0).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.stockControls}>
                      <Text style={styles.stockLabel}>Qty:</Text>
                      <Picker
                        style={styles.stockPicker}
                        selectedValue={String(item.qty)}
                        onValueChange={(value) => updateStock(item, Number(value))}
                      >
                        {[0, 1, 5, 10, 20, 50, 100].map((q) => (
                          <Picker.Item key={q} label={String(q)} value={String(q)} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}
          <TouchableOpacity style={styles.addBtn} onPress={addProduct}>
            <Text style={styles.addText}>+ Agregar producto</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 12,
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...text.body,
    fontSize: 14,
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: text.label.fontFamily,
    fontWeight: '600',
    fontSize: 14,
    color: colors.muted,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
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
    marginBottom: 8,
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
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.error,
    borderRadius: radius.md,
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  picker: {
    flex: 1,
    color: colors.onBackground,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 20,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontFamily: text.label.fontFamily,
    fontWeight: '600',
    fontSize: 15,
    color: colors.onBackground,
  },
  productPrice: {
    ...text.bodyMuted,
    fontSize: 13,
  },
  stockControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  stockPicker: {
    width: 90,
    color: colors.onBackground,
  },
  addBtn: {
    backgroundColor: colors.success,
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  addText: {
    ...text.button,
    color: '#FFFFFF',
  },
});
