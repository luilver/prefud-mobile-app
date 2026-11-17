import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StatusBar, ScrollView, TouchableOpacity, Alert,
  TextInput, Switch, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/api';
import { ENDPOINTS } from '../api/endpoints';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { colors, text, radius, spacing, makeStyles } from '../theme';

const unwrapItems = (data) => (Array.isArray(data) ? data : data?.items || []);

export default function VendorScreen({ navigation }) {
  const { logout, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [showVendorPicker, setShowVendorPicker] = useState(false);

  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductList, setShowProductList] = useState(false);

  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const [priceDrafts, setPriceDrafts] = useState({});

  const marketId = user?.marketId || user?.market || null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [productsData, unitsData, vendorsData, inventoriesData] =
          await Promise.all([
            api.get(`${ENDPOINTS.catalog.products}?limit=100`),
            api.get(ENDPOINTS.catalog.units),
            api.get(ENDPOINTS.vendors.vendors),
            api.get(ENDPOINTS.vendors.inventories),
          ]);
        if (!mounted) return;

        const vendorList = Array.isArray(vendorsData) ? vendorsData : [];
        const unitList = Array.isArray(unitsData) ? unitsData : [];

        setProducts(unwrapItems(productsData));
        setUnits(unitList);
        setVendors(vendorList);
        setInventories(Array.isArray(inventoriesData) ? inventoriesData : []);

        const defaultVendor =
          vendorList.find((v) => v.id === user?.vendorId) ||
          vendorList.find((v) => marketId && v.marketId === marketId) ||
          vendorList[0];
        setSelectedVendorId(defaultVendor?.id || null);

        const defaultUnit =
          unitList.find((u) => u.name?.toLowerCase().includes('libra')) ||
          unitList[0];
        setSelectedUnitId(defaultUnit?.id || null);
      } catch (err) {
        if (mounted) setError(err.message || 'No se pudo cargar la información.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const refetchInventories = async (vendorId = selectedVendorId) => {
    try {
      const url = vendorId
        ? `${ENDPOINTS.vendors.inventories}?vendorId=${vendorId}`
        : ENDPOINTS.vendors.inventories;
      const data = await api.get(url);
      setInventories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudo recargar el inventario.');
    }
  };

  const selectVendor = (vendor) => {
    setSelectedVendorId(vendor.id);
    setShowVendorPicker(false);
    refetchInventories(vendor.id);
  };

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products.slice(0, 50);
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const syn = (p.searchSynonyms || '').toLowerCase();
      return name.includes(term) || syn.includes(term);
    });
  }, [products, productSearch]);

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setShowProductList(false);
  };

  const clearProductSelection = () => {
    setSelectedProduct(null);
    setProductSearch('');
    setShowProductList(false);
  };

  const selectedUnit = units.find((u) => u.id === selectedUnitId) || null;
  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) || null;

  const addToInventory = async () => {
    if (!selectedVendorId) {
      Alert.alert('Falta el puesto', 'Selecciona el puesto del proveedor.');
      return;
    }
    if (!selectedProduct?.id) {
      Alert.alert('Falta el producto', 'Busca y selecciona un producto del catálogo.');
      return;
    }
    if (!selectedUnitId) {
      Alert.alert('Falta la unidad', 'Selecciona una unidad de medida.');
      return;
    }
    const priceValue = Number(price);
    if (!price || Number.isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio válido (mayor o igual a 0).');
      return;
    }

    const alreadyExists = inventories.some(
      (inv) => inv.productId === selectedProduct.id && inv.vendorId === selectedVendorId
    );
    if (alreadyExists) {
      Alert.alert('Ya existe', 'Ese producto ya está en el inventario de este puesto.');
      return;
    }

    setSaving(true);
    try {
      await api.post(ENDPOINTS.vendors.inventories, {
        vendorId: selectedVendorId,
        productId: selectedProduct.id,
        unitOfMeasureId: selectedUnitId,
        price: priceValue,
        isAvailable: true,
      });
      Alert.alert('Producto agregado al inventario');
      clearProductSelection();
      setPrice('');
      await refetchInventories();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo agregar al inventario');
    } finally {
      setSaving(false);
    }
  };

  const updateInventory = async (item, field, value) => {
    try {
      await api.patch(ENDPOINTS.vendors.inventoryById(item.id), {
        [field]: value,
      });
      setInventories((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, [field]: value } : i))
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo actualizar el inventario');
    }
  };

  const savePrice = async (item) => {
    const draft = priceDrafts[item.id];
    const value = Number(draft);
    if (draft === undefined || draft === '' || Number.isNaN(value) || value < 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio válido (mayor o igual a 0).');
      return;
    }
    await updateInventory(item, 'price', value);
    setPriceDrafts((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <Loading message="Cargando inventario…" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Inventario — Proveedor</Text>
            <Text style={styles.subtitle}>
              Puesto: {selectedVendor?.name || 'Sin seleccionar'}
            </Text>
          </View>
          <TouchableOpacity style={styles.signout} onPress={logout}>
            <Text style={styles.signoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Agregar producto al inventario</Text>

          {vendors.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.selectRow}
                onPress={() => setShowVendorPicker(!showVendorPicker)}
              >
                <Text style={styles.selectLabel}>
                  Puesto: {selectedVendor?.name || 'Seleccionar puesto'}
                </Text>
              </TouchableOpacity>
              {showVendorPicker && (
                <View style={styles.pickerList}>
                  {vendors.map((v) => (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.pickerItem,
                        selectedVendorId === v.id && styles.pickerItemSelected,
                      ]}
                      onPress={() => selectVendor(v)}
                    >
                      <Text style={styles.pickerItemText}>{v.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Buscar producto del catálogo…"
            value={productSearch}
            onChangeText={(t) => {
              setProductSearch(t);
              setSelectedProduct(null);
              setShowProductList(true);
            }}
            onFocus={() => setShowProductList(true)}
            autoCapitalize="none"
          />
          {selectedProduct && (
            <View style={styles.selectedChip}>
              <Text style={styles.selectedChipText}>{selectedProduct.name}</Text>
              <TouchableOpacity onPress={clearProductSelection}>
                <Text style={styles.selectedChipClear}>Quitar</Text>
              </TouchableOpacity>
            </View>
          )}
          {showProductList && !selectedProduct && (
            <View style={styles.pickerList}>
              {filteredProducts.length === 0 ? (
                <Text style={styles.pickerEmpty}>Sin resultados</Text>
              ) : (
                filteredProducts.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.pickerItem}
                    onPress={() => selectProduct(p)}
                  >
                    <Text style={styles.pickerItemText}>{p.name}</Text>
                    {p.category?.name ? (
                      <Text style={styles.pickerItemMeta}>{p.category.name}</Text>
                    ) : null}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.selectRow}
            onPress={() => setShowUnitPicker(!showUnitPicker)}
          >
            <Text style={styles.selectLabel}>
              Unidad: {selectedUnit?.name || 'Seleccionar unidad'}
            </Text>
          </TouchableOpacity>
          {showUnitPicker && (
            <View style={styles.pickerList}>
              {units.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={[
                    styles.pickerItem,
                    selectedUnitId === u.id && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedUnitId(u.id);
                    setShowUnitPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{u.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Precio (USD)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.addBtn, saving && styles.addBtnDisabled]}
            onPress={addToInventory}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.addText}>+ Agregar al inventario</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi inventario</Text>
          {inventories.length === 0 ? (
            <EmptyState
              title="Sin ítems de inventario"
              message="Busca un producto del catálogo y agrégalo con su precio."
              style={{ flex: 0 }}
            />
          ) : (
            <>
              {inventories.map((item) => (
                <View style={styles.card} key={item.id}>
                  <View style={styles.inventoryTop}>
                    <Text style={styles.productName}>
                      {item.product?.name || 'Producto'}
                    </Text>
                    <Text style={styles.productMeta}>
                      ${Number(item.price || 0).toFixed(2)}
                      {item.unitOfMeasure?.name ? ` · ${item.unitOfMeasure.name}` : ''}
                    </Text>
                  </View>
                  <View style={styles.editControls}>
                    <TextInput
                      style={styles.qtyInput}
                      placeholder={String(item.price ?? '')}
                      value={priceDrafts[item.id] ?? ''}
                      onChangeText={(v) =>
                        setPriceDrafts((prev) => ({ ...prev, [item.id]: v }))
                      }
                      keyboardType="numeric"
                    />
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={() => savePrice(item)}
                    >
                      <Text style={styles.saveText}>Guardar</Text>
                    </TouchableOpacity>
                    <Switch
                      style={styles.switch}
                      value={item.isAvailable === true}
                      onValueChange={(v) => updateInventory(item, 'isAvailable', v)}
                    />
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

        <TouchableOpacity style={styles.signoutWide} onPress={logout}>
          <Text style={styles.signoutText}>Salir</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = makeStyles({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: spacing.md,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.error,
    borderRadius: radius.lg,
    marginLeft: 8,
  },
  signoutWide: {
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
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    padding: 12,
    marginHorizontal: spacing.md,
    marginBottom: 12,
  },
  errorText: {
    ...text.body,
    color: colors.error,
    fontSize: 13,
  },
  addForm: {
    paddingHorizontal: spacing.md,
    gap: 10,
    marginBottom: 16,
  },
  formTitle: {
    fontFamily: text.label.fontFamily,
    fontWeight: '600',
    fontSize: 14,
    color: colors.muted,
    marginBottom: 2,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.onBackground,
  },
  selectRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectLabel: {
    ...text.body,
    fontSize: 16,
    color: colors.onBackground,
  },
  pickerList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginTop: 4,
    maxHeight: 220,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemSelected: {
    backgroundColor: '#EFF6F2',
  },
  pickerItemText: {
    ...text.body,
    fontSize: 15,
    color: colors.onBackground,
  },
  pickerItemMeta: {
    ...text.bodyMuted,
    fontSize: 12,
    marginTop: 2,
  },
  pickerEmpty: {
    ...text.bodyMuted,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6F2',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectedChipText: {
    ...text.body,
    fontSize: 14,
    color: colors.onBackground,
    flex: 1,
  },
  selectedChipClear: {
    ...text.body,
    fontSize: 13,
    color: colors.error,
    marginLeft: 8,
  },
  addBtn: {
    backgroundColor: colors.success,
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.6,
  },
  addText: {
    ...text.button,
    color: '#FFFFFF',
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
  inventoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  productName: {
    fontFamily: text.label.fontFamily,
    fontWeight: '600',
    fontSize: 15,
    color: colors.onBackground,
    flex: 1,
  },
  productMeta: {
    ...text.bodyMuted,
    fontSize: 13,
  },
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.onBackground,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  bottomSpacer: {
    height: 24,
  },
});
