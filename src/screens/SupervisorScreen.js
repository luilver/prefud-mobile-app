import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/api';
import { ENDPOINTS } from '../api/endpoints';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';

export default function SupervisorScreen({ navigation }) {
  const { logout } = useAuth();
  const [markets, setMarkets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [marketsData, ordersData] = await Promise.all([
        api.get(ENDPOINTS.locations.markets),
        api.get(ENDPOINTS.orders.orders),
      ]);
      setMarkets(marketsData || []);
      setOrders(ordersData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.title}>Supervisor Dashboard</Text>
        <Text style={styles.subtitle}>Overview of markets and orders</Text>
        <TouchableOpacity style={styles.signout} onPress={logout}>
          <Text style={styles.signoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={fetchDashboard}>
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>

      {loading ? (
        <Loading message="Loading dashboard..." />
      ) : error ? (
        <EmptyState
          title="Failed to Load"
          message={error}
          onRetry={fetchDashboard}
        />
      ) : (
        <View style={styles.sections}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Markets ({markets.length})</Text>
            <FlatList
              data={markets}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => Alert.alert(item.name || 'Market', `Delivery: ${item.isDeliveryAvailable ? 'Yes' : 'No'}\nPickup: ${item.isPickupAvailable ? 'Yes' : 'No'}`)}
                >
                  <Text style={styles.itemName}>{item.name || 'Market'}</Text>
                  <Text style={styles.itemSub}>
                    {item.isDeliveryAvailable ? '🚚 Delivery' : ''} {item.isPickupAvailable ? '🏪 Pickup' : ''}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Orders ({orders.length})</Text>
            <FlatList
              data={orders}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => Alert.alert(`Order ${item.id?.slice(0, 8) || 'N/A'}`, `Status: ${item.status || 'N/A'}\nTotal: $${item.total_amount || '0.00'}`)}
                >
                  <Text style={styles.itemName}>Order #{item.id?.slice(0, 8) || 'N/A'}</Text>
                  <Text style={styles.itemSub}>
                    {item.status || 'Unknown'} · $${item.total_amount || '0.00'}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  refreshBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  refreshText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  signout: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EF4444',
    borderRadius: 16,
  },
  signoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  sections: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  itemSub: {
    fontSize: 13,
    color: '#64748B',
  },
});
