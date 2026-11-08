import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/api';
import { ENDPOINTS } from '../api/endpoints';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';

export default function DelivererScreen({ navigation }) {
  const { logout } = useAuth();
  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeliverers();
  }, []);

  const fetchDeliverers = async () => {
    try {
      setLoading(true);
      const data = await api.get(ENDPOINTS.fulfillment.deliverers);
      setDeliverers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Alert.alert(item.name || 'Deliverer', `Phone: ${item.phone || 'N/A'}\nEmail: ${item.email || 'N/A'}`)}
    >
      <Text style={styles.name}>{item.name || 'Deliverer'}</Text>
      <Text style={styles.details}>{item.phone || 'No phone'} · {item.email || 'No email'}</Text>
      <Text style={styles.status}>{item.isActive ? 'Active' : 'Inactive'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.title}>Deliverer Dashboard</Text>
        <Text style={styles.subtitle}>Manage deliveries and tracking</Text>
        <TouchableOpacity style={styles.signout} onPress={logout}>
          <Text style={styles.signoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={fetchDeliverers}>
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>

      {loading ? (
        <Loading message="Loading deliverers..." />
      ) : error ? (
        <EmptyState
          title="Failed to Load"
          message={error}
          onRetry={fetchDeliverers}
        />
      ) : deliverers.length === 0 ? (
        <EmptyState title="No Deliverers" message="No deliverers registered." />
      ) : (
        <FlatList
          data={deliverers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
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
    backgroundColor: '#3B82F6',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  listContent: {
    paddingBottom: 20,
  },
});
