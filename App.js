import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RoleSelector } from './src/components/RoleSelector';
import ProviderScreen from './src/screens/ProviderScreen';
import DelivererScreen from './src/screens/DelivererScreen';
import SupervisorScreen from './src/screens/SupervisorScreen';
import LogisticScreen from './src/screens/LogisticScreen';
import LoginScreen from './src/screens/LoginScreen';
import { AuthProvider, useAuth } from './src/hooks/useAuth';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
        <Text style={styles.loadingText}>Signing in…</Text>
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
            <Stack.Screen
              name="RoleSelection"
              component={RoleSelectionScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Provider" component={ProviderScreen} />
            <Stack.Screen name="Deliverer" component={DelivererScreen} />
            <Stack.Screen name="Supervisor" component={SupervisorScreen} />
            <Stack.Screen name="Logistic" component={LogisticScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function RoleSelectionScreen({ navigation }) {
  const { logout } = useAuth();
  return (
    <SafeAreaView style={styles.container}>
      <RoleSelector
        onSelectRole={(role) => {
          navigation.navigate(role);
        }}
      />
      <TouchableOpacity style={styles.signout} onPress={logout}>
        <Text style={styles.signoutText}>Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 16,
  },
  signout: {
    alignSelf: 'flex-start',
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    marginHorizontal: 16,
  },
  signoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
