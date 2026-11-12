import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { colors, text, radius, spacing, makeStyles } from '../theme';

export default function DeliveryMapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params || {};

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const pickupLat = order?.pickupLat ?? order?.pickup?.lat ?? null;
  const pickupLng = order?.pickupLng ?? order?.pickup?.lng ?? null;
  const deliveryLat = order?.deliveryLat ?? order?.delivery?.lat ?? null;
  const deliveryLng = order?.deliveryLng ?? order?.delivery?.lng ?? null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permiso de ubicación no concedido.');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (mounted) {
          setCurrentLocation(loc.coords);
        }
      } catch (err) {
        if (mounted) {
          setLocationError('No se pudo obtener la ubicación actual.');
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onMapPress = () => {
    const parts = [
      'Mapa — recogida y entrega',
      `Recogida: ${pickupLat != null && pickupLng != null ? `${pickupLat.toFixed(6)}, ${pickupLng.toFixed(6)}` : 'N/A'}`,
      `Entrega: ${deliveryLat != null && deliveryLng != null ? `${deliveryLat.toFixed(6)}, ${deliveryLng.toFixed(6)}` : 'N/A'}`,
      currentLocation
        ? `Tu posición: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
        : 'Tu posición: no disponible',
    ];
    Alert.alert(parts.join('\n'), undefined, [{ text: 'Aceptar' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mapa del pedido</Text>
      </View>

      <View style={styles.mapContainer}>
        <TouchableOpacity style={styles.mapPlaceholder} onPress={onMapPress}>
          <View style={styles.mapIcon}>
            <Text style={styles.mapIconText}>📍</Text>
          </View>
          <Text style={styles.mapHint}>Mapa — recogida y entrega</Text>
        </TouchableOpacity>
        {locationError && (
          <View style={styles.locationError}>
            <Text style={styles.locationErrorText}>{locationError}</Text>
          </View>
        )}
      </View>

      <View style={styles.coordsCard}>
        <Text style={styles.sectionTitle}>Tu posición actual</Text>
        <View style={styles.coordPair}>
          <Text style={styles.coordLabel}>Latitud</Text>
          <Text style={styles.coordValue}>
            {currentLocation != null ? currentLocation.latitude.toFixed(6) : 'N/A'}
          </Text>
        </View>
        <View style={styles.coordPair}>
          <Text style={styles.coordLabel}>Longitud</Text>
          <Text style={styles.coordValue}>
            {currentLocation != null ? currentLocation.longitude.toFixed(6) : 'N/A'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
          Coordenadas de recogida
        </Text>
        <View style={styles.coordPair}>
          <Text style={styles.coordLabel}>Latitud</Text>
          <Text style={styles.coordValue}>
            {pickupLat != null ? pickupLat.toFixed(6) : 'N/A'}
          </Text>
        </View>
        <View style={styles.coordPair}>
          <Text style={styles.coordLabel}>Longitud</Text>
          <Text style={styles.coordValue}>
            {pickupLng != null ? pickupLng.toFixed(6) : 'N/A'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
          Coordenadas de entrega
        </Text>
        <View style={styles.coordPair}>
          <Text style={styles.coordLabel}>Latitud</Text>
          <Text style={styles.coordValue}>
            {deliveryLat != null ? deliveryLat.toFixed(6) : 'N/A'}
          </Text>
        </View>
        <View style={styles.coordPair}>
          <Text style={styles.coordLabel}>Longitud</Text>
          <Text style={styles.coordValue}>
            {deliveryLng != null ? deliveryLng.toFixed(6) : 'N/A'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.btnDone} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>Volver a pedidos</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = makeStyles({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: 16,
  },
  back: {
    marginRight: 12,
  },
  backText: {
    fontSize: 20,
    color: colors.onBackground,
  },
  title: {
    ...text.h3,
    flex: 1,
  },
  mapContainer: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: 16,
  },
  mapPlaceholder: {
    width: '100%',
    height: 260,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapIconText: {
    fontSize: 28,
  },
  mapHint: {
    ...text.bodyMuted,
    fontSize: 14,
  },
  locationError: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: radius.md,
    alignItems: 'center',
  },
  locationErrorText: {
    ...text.bodyMuted,
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  coordsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: text.label.fontFamily,
    fontWeight: '600',
    fontSize: 14,
    color: colors.muted,
    marginBottom: 10,
  },
  coordPair: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  coordLabel: {
    ...text.bodyMuted,
    fontSize: 14,
  },
  coordValue: {
    fontFamily: text.label.fontFamily,
    fontSize: 14,
    color: colors.onBackground,
  },
  btnDone: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: 16,
  },
  btnText: {
    ...text.button,
  },
});
