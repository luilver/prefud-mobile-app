import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TextInput, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { storeAuth, DEV_TOKEN } from '../api/auth';
import { USER_ROLES } from '../api/endpoints';
import { colors, text, spacing, radius, makeStyles } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [registering, setRegistering] = useState(false);
  const { login, isAuthenticated, loading, setAuthState } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos faltantes', 'Por favor ingresa tu email y contraseña.');
      return;
    }
    setLoggingIn(true);
    try {
      const result = await login(email, password);
      const route = result?.role ? (require('../api/endpoints').ROUTE_BY_ROLE[result.role] || 'RoleSelection') : 'RoleSelection';
      navigation.replace(route);
    } catch (err) {
      if (err.name === 'AuthError') {
        Alert.alert('Autenticación fallida', err.message);
      } else {
        Alert.alert('Error de login', err.message || 'Algo salió mal.');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleRegisterVendor = async () => {
    if (!email || !password) {
      Alert.alert('Campos faltantes', 'Por favor ingresa tu usuario y contraseña.');
      return;
    }
    setRegistering(true);
    try {
      const vendorUser = {
        id: 'vendor-0001',
        username: email,
        email,
        role: USER_ROLES.VENDOR,
        isActive: true,
      };
      await storeAuth(DEV_TOKEN, vendorUser);
      setAuthState(DEV_TOKEN, vendorUser);
      const route = require('../api/endpoints').ROUTE_BY_ROLE[USER_ROLES.VENDOR] || 'Vendor';
      navigation.replace(route);
    } catch (err) {
      Alert.alert('Error al crear cuenta', err.message || 'Algo salió mal.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido de vuelta</Text>
        <Text style={styles.subtitle}>Inicia sesión en tu cuenta Prefud</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCompleteType="username"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => (password ? handleLogin() : null)}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCompleteType="password"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />
      </View>

      {loading || loggingIn ? (
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.muted }]} disabled>
          <ActivityIndicator size="small" color={colors.onPrimary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Iniciar sesión</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.accent }]}
        disabled={registering}
        onPress={handleRegisterVendor}
      >
        {registering ? (
          <ActivityIndicator size="small" color={colors.onPrimary} />
        ) : (
          <Text style={styles.btnText}>Crear cuenta de proveedor</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Las cuentas de proveedor se crean en modo desarrollo. Los demás usuarios: contacta al
          administrador.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = makeStyles({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 32,
    marginBottom: 32,
  },
  title: {
    ...text.h1,
    marginBottom: 8,
  },
  subtitle: {
    ...text.bodyMuted,
  },
  form: {
    paddingHorizontal: 24,
    gap: 12,
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
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    ...text.button,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  footerText: {
    ...text.bodyMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
