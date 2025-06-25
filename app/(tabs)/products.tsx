import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useProducts } from '../../contexts/ProductsContext';

export default function ProductsScreen() {
  const { products, loading, error, refreshProducts } = useProducts();

  useEffect(() => {
    refreshProducts();
  }, []);

  if (loading && products.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Products</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        onRefresh={refreshProducts}
        refreshing={loading && products.length > 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  productCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 8,
    fontWeight: '500',
  },
  productDescription: {
    color: '#6c757d',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
});
