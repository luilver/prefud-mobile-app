import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/api';
import { ENDPOINTS } from '../api/endpoints';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';

export default function LogisticScreen({ navigation }) {
  const [vendors, setVendors] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vendorsData, inventoriesData] = await Promise.all([
        api.get(ENDPOINTS.vendors.vendors),
        api.get(ENDPOINTS.vendors.inventories),
      ]);
      setVendors(vendorsData || []);
      setInventories(inventoriesData || []);
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
        <Text style={styles.title}>Logistic Dashboard</Text>
        <Text style={styles.subtitle}>Manage vendors and inventory stock</Text>
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>

      {loading ? (
        <Loading message="Loading logistic data..." />
      ) : error ? (
        <EmptyState
          title="Failed to Load"
          message={error}
          onRetry={fetchData}
        />
      ) : (
        <View style={styles.sections}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vendors ({vendors.length})</Text>
            <FlatList
              data={vendors}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => Alert.alert(item.name || 'Vendor', `Stall: ${item.stall_number || 'N/A'}\nMarket: ${item.market_id || 'N/A'}`)}
                >
                  <Text style={styles.itemName}>{item.name || 'Vendor'}</Text>
                  <Text style={styles.itemSub}>Stall: {item.stall_number || 'N/A'}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inventory Items ({inventories.length})</Text>
            <FlatList
              data={inventories}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => Alert.alert(
                    `Inventory ${item.id?.slice(0, 8) || 'N/A'}`,
                    `Price: $${item.price || '0.00'}\nAvailable: ${item.is_available ? 'Yes' : 'No'}`,
                  )}
                >
                  <Text style={styles.itemName}>Inventory #{item.id?.slice(0, 8) || 'N/A'}</Text>
                  <Text style={styles.itemSub}>
                    $${item.price || '0.00'} · {item.is_available ? 'Available' : 'Unavailable'}
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
    backgroundColor: '#EF4444',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  refreshText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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
