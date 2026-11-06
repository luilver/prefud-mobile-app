import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RoleSelector } from './src/components/RoleSelector';
import ProviderScreen from './src/screens/ProviderScreen';
import DelivererScreen from './src/screens/DelivererScreen';
import SupervisorScreen from './src/screens/SupervisorScreen';
import LogisticScreen from './src/screens/LogisticScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="Provider" component={ProviderScreen} />
          <Stack.Screen name="Deliverer" component={DelivererScreen} />
          <Stack.Screen name="Supervisor" component={SupervisorScreen} />
          <Stack.Screen name="Logistic" component={LogisticScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function RoleSelectionScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <RoleSelector onSelectRole={(role) => navigation.navigate(role)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
