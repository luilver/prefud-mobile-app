import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TextInput, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { colors, text, spacing, radius, makeStyles } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();

  // Navigate to role selection once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('RoleSelection');
    }
  }, [isAuthenticated, navigation]);

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
      await login(email, password);
      navigation.navigate('RoleSelection');
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

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Los usuarios no se crean desde la aplicación. Contacta al administrador.
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
