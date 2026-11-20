import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StatusBar, FlatList, TouchableOpacity, Alert, TextInput,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/api';
import { ENDPOINTS, ORDER_STATUSES } from '../api/endpoints';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { BackButton } from '../components/BackButton';
import { OptionPicker } from '../components/OptionPicker';
import { useAuth } from '../hooks/useAuth';
import { colors, text, radius, spacing, makeStyles } from '../theme';

const unwrapItems = (data) => (Array.isArray(data) ? data : data?.items || []);

const STATUS_OPTIONS = [
  { value: ORDER_STATUSES.CREATED, label: 'Creado' },
  { value: ORDER_STATUSES.PAID, label: 'Pagado' },
  { value: ORDER_STATUSES.PREPARING, label: 'Preparando' },
  { value: ORDER_STATUSES.PICKING_UP, label: 'En recolección' },
  { value: ORDER_STATUSES.DELIVERING, label: 'En camino' },
  { value: ORDER_STATUSES.COMPLETED, label: 'Completado' },
  { value: ORDER_STATUSES.CANCELLED, label: 'Cancelado' },
];

export default function CentroAcoqueScreen({ navigation }) {
  const { logout, user } = useAuth();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [catalogProducts, setCatalogProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [inventories, setInventories] = useState([]);

  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [showVendorPicker, setShowVendorPicker] = useState(false);

  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductList, setShowProductList] = useState(false);

  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(false);

  const marketId = user?.marketId || user?.market || null;

  const collapsePickers = useCallback(() => {
    setShowVendorPicker(false);
    setShowProductList(false);
    setShowUnitPicker(false);
  }, []);

  useEffect(() => {
    const doc = globalThis.document;
    if (Platform.OS !== 'web' || !doc) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') collapsePickers();
    };
    doc.addEventListener('keydown', handleKeyDown);
    return () => doc.removeEventListener('keydown', handleKeyDown);
  }, [collapsePickers]);

  const marketVendors = useMemo(
    () =>
      marketId
        ? vendors.filter((v) => v.marketId === marketId || v.market?.id === marketId)
        : vendors,
    [vendors, marketId]
  );

  const selectedVendor = marketVendors.find((v) => v.id === selectedVendorId) || null;
  const selectedUnit = units.find((u) => u.id === selectedUnitId) || null;

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return catalogProducts.slice(0, 50);
    return catalogProducts.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const synonyms = Array.isArray(p.searchSynonyms)
        ? p.searchSynonyms.join(' ').toLowerCase()
        : (p.searchSynonyms || '').toLowerCase();
      return name.includes(term) || synonyms.includes(term);
    });
  }, [catalogProducts, productSearch]);

  const fetchData = async () => {
    try {
      const [ordersData, productsData, unitsData, vendorsData] = await Promise.all([
        api.get(ENDPOINTS.orders.orders),
        api.get(`${ENDPOINTS.catalog.products}?limit=100`),
        api.get(ENDPOINTS.catalog.units),
        api.get(ENDPOINTS.vendors.vendors),
      ]);

      const unitList = unwrapItems(unitsData);
      const vendorList = unwrapItems(vendorsData);
      const marketVendorList = marketId
        ? vendorList.filter((v) => v.marketId === marketId || v.market?.id === marketId)
        : vendorList;

      setOrders(unwrapItems(ordersData));
      setCatalogProducts(unwrapItems(productsData));
      setUnits(unitList);
      setVendors(vendorList);

      const defaultVendor =
        marketVendorList.find((v) => v.id === user?.vendorId) || marketVendorList[0];
      setSelectedVendorId(defaultVendor?.id || null);
      if (defaultVendor?.id) await refetchInventories(defaultVendor.id);

      const defaultUnit =
        unitList.find((u) => u.name?.toLowerCase() === 'unidad') ||
        unitList.find((u) => u.name?.toLowerCase().includes('libra')) ||
        unitList[0];
      setSelectedUnitId(defaultUnit?.id || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refetchInventories = async (vendorId = selectedVendorId) => {
    try {
      const url = vendorId
        ? `${ENDPOINTS.vendors.inventories}?vendorId=${vendorId}`
        : ENDPOINTS.vendors.inventories;
      const data = await api.get(url);
      setInventories(unwrapItems(data));
    } catch (err) {
      setError(err.message || 'No se pudo cargar el inventario.');
    }
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  const selectVendor = async (vendor) => {
    setSelectedVendorId(vendor.id);
    setShowVendorPicker(false);
    setDrafts({});
    await refetchInventories(vendor.id);
  };

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

  const addStockItem = async () => {
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
    const qtyValue = Number(stockQty);
    if (price === '' || Number.isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio válido (mayor o igual a 0).');
      return;
    }
    if (stockQty === '' || Number.isNaN(qtyValue) || qtyValue < 0) {
      Alert.alert('Cantidad inválida', 'Ingresa una cantidad válida (mayor o igual a 0).');
      return;
    }

    const alreadyExists = inventories.some(
      (inv) => inv.productId === selectedProduct.id && inv.vendorId === selectedVendorId
    );
    if (alreadyExists) {
      Alert.alert(
        'Ya existe',
        'Ese producto ya está en el inventario de este puesto. Edita su precio y cantidad en la lista.'
      );
      return;
    }

    setSaving(true);
    try {
      await api.post(ENDPOINTS.vendors.inventories, {
        vendorId: selectedVendorId,
        productId: selectedProduct.id,
        unitOfMeasureId: selectedUnitId,
        price: priceValue,
        stockQty: qtyValue,
        isAvailable: true,
      });
      Alert.alert('Producto agregado', 'Precio y cantidad guardados en el inventario.');
      clearProductSelection();
      setPrice('');
      setStockQty('');
      await refetchInventories();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo agregar al inventario');
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = (item, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [item.id]: { ...prev[item.id], [field]: value },
    }));
  };

  const saveInventoryItem = async (item) => {
    const draft = drafts[item.id] || {};
    const priceValue = Number(draft.price);
    const qtyValue = Number(draft.stockQty);

    if (draft.price === undefined || draft.price === '' || Number.isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio válido (mayor o igual a 0).');
      return;
    }
    if (draft.stockQty === undefined || draft.stockQty === '' || Number.isNaN(qtyValue) || qtyValue < 0) {
      Alert.alert('Cantidad inválida', 'Ingresa una cantidad válida (mayor o igual a 0).');
      return;
    }

    try {
      await api.patch(ENDPOINTS.vendors.inventoryById(item.id), {
        price: priceValue,
        stockQty: qtyValue,
      });
      setInventories((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, price: priceValue, stockQty: qtyValue } : i
        )
      );
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      Alert.alert('Inventario actualizado');
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo actualizar el inventario');
    }
  };

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
        prev.map((o) => (o.id === order.id ? { ...o, status: ORDER_STATUSES.CANCELLED } : o))
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo cancelar el pedido');
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
        <BackButton />
        <Text style={styles.title}>Centro de Acoque</Text>
        <Text style={styles.subtitle}>
          Mercado: {user?.marketName || marketId || 'Sin mercado asignado'}
        </Text>
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
                    <OptionPicker
                      style={styles.picker}
                      value={item.status}
                      options={STATUS_OPTIONS}
                      onValueChange={(value) => updateOrderStatus(item, value)}
                    />
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onTouchEnd={collapsePickers}
        >
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.addForm}>
            <Text style={styles.formTitle}>
              Puesto: {selectedVendor?.name || 'Seleccionar puesto'}
            </Text>
            {marketVendors.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.selectRow}
                  onPress={() => setShowVendorPicker(!showVendorPicker)}
                >
                  <Text style={styles.selectLabel}>
                    {selectedVendor?.name || 'Seleccionar puesto'}
                  </Text>
                </TouchableOpacity>
                {showVendorPicker && (
                  <View style={styles.pickerList}>
                    {marketVendors.map((v) => (
                      <TouchableOpacity
                        key={v.id}
                        style={[
                          styles.pickerItem,
                          selectedVendorId === v.id && styles.pickerItemSelected,
                        ]}
                        onPress={() => selectVendor(v)}
                      >
                        <Text style={styles.pickerItemText}>{v.name}</Text>
                        {v.stallNumber ? (
                          <Text style={styles.pickerItemMeta}>Puesto {v.stallNumber}</Text>
                        ) : null}
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

            <View style={styles.priceRow}>
              <TextInput
                style={styles.inputHalf}
                placeholder="Precio"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={styles.inputHalf}
                placeholder="Cantidad"
                value={stockQty}
                onChangeText={setStockQty}
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.addBtn, saving && styles.addBtnDisabled]}
              onPress={addStockItem}
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
            <Text style={styles.sectionTitle}>Inventario del puesto</Text>
            {inventories.length === 0 ? (
              <EmptyState
                title="Sin ítems de inventario"
                message="Busca un producto del catálogo y agrégalo con precio y cantidad."
                style={{ flex: 0 }}
              />
            ) : (
              inventories.map((item) => (
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
                  <View style={styles.productMeta}>
                    Cantidad: {Number(item.stockQty || 0).toFixed(3)}
                  </View>
                  <View style={styles.editControls}>
                    <TextInput
                      style={styles.qtyInput}
                      placeholder={String(item.price ?? '')}
                      value={drafts[item.id]?.price ?? ''}
                      onChangeText={(v) => updateDraft(item, 'price', v)}
                      keyboardType="decimal-pad"
                    />
                    <TextInput
                      style={styles.qtyInput}
                      placeholder={String(item.stockQty ?? 0)}
                      value={drafts[item.id]?.stockQty ?? ''}
                      onChangeText={(v) => updateDraft(item, 'stockQty', v)}
                      keyboardType="decimal-pad"
                    />
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={() => saveInventoryItem(item)}
                    >
                      <Text style={styles.saveText}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
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
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 20,
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
  inputHalf: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.onBackground,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
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
  inventoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 8,
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
  bottomSpacer: {
    height: 24,
  },
});
