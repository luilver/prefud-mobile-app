import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import OrdersListScreen from './src/screens/OrdersListScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import DeliveryBoyScreen from './src/screens/DeliveryBoyScreen';
import DeliveryMapScreen from './src/screens/DeliveryMapScreen';
import SupervisorScreen from './src/screens/SupervisorScreen';
import CentroAcoqueScreen from './src/screens/CentroAcoqueScreen';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { colors, text, spacing, radius, makeStyles } from './src/theme';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loadingText}>Iniciando sesión…</Text>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ gestureEnabled: false }} />
        ) : (
          <>
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="OrdersList" component={OrdersListScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="DeliveryBoy" component={DeliveryBoyScreen} />
            <Stack.Screen name="DeliveryMap" component={DeliveryMapScreen} />
            <Stack.Screen name="Supervisor" component={SupervisorScreen} />
            <Stack.Screen name="CentroAcoque" component={CentroAcoqueScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function RoleSelectionScreen({ navigation }) {
  const { logout, isDeliveryBoy, isSupervisor, isCentroAcoque } = useAuth();

  const targetRoute = isDeliveryBoy
    ? 'DeliveryBoy'
    : isSupervisor
      ? 'Supervisor'
      : isCentroAcoque
        ? 'CentroAcoque'
        : null;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Selecciona tu destino</Text>
      <TouchableOpacity style={styles.btnOrders} onPress={() => navigation.navigate('OrdersList')}>
        <Text style={styles.btnText}>Ver pedidos</Text>
      </TouchableOpacity>
      {targetRoute && (
        <TouchableOpacity
          style={styles.btnRole}
          onPress={() => navigation.navigate(targetRoute)}
        >
          <Text style={styles.btnText}>
            {isDeliveryBoy ? 'Mis pedidos (Delivery)' : isSupervisor ? 'Gestionar estados' : 'Gestionar stock'}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.signout} onPress={logout}>
        <Text style={styles.signoutText}>Salir</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = makeStyles({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...text.bodyMuted,
  },
  title: {
    ...text.h4,
    alignSelf: 'center',
    marginBottom: 24,
  },
  btnOrders: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    marginBottom: 12,
  },
  btnRole: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    marginBottom: 24,
  },
  btnText: {
    ...text.button,
    color: '#FFFFFF',
  },
  signout: {
    alignSelf: 'flex-start',
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.error,
    borderRadius: radius.pill,
    marginHorizontal: 16,
  },
  signoutText: {
    ...text.button,
    fontSize: 14,
  },
});
