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

export default function ProviderScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.get(ENDPOINTS.catalog.products);
      setProducts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <ProductCard item={item} onPress={() => Alert.alert(item.name, item.description || 'No description')} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.title}>Provider Dashboard</Text>
        <Text style={styles.subtitle}>Manage products and inventory</Text>
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={fetchProducts}>
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>

      {loading ? (
        <Loading message="Loading products..." />
      ) : error ? (
        <EmptyState
          title="Failed to Load"
          message={error}
          onRetry={fetchProducts}
        />
      ) : products.length === 0 ? (
        <EmptyState title="No Products" message="No products found in the catalog." />
      ) : (
        <FlatList
          data={products}
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
    backgroundColor: '#10B981',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  refreshText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});
