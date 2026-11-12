import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/api';
import { ENDPOINTS, USER_ROLES } from '../api/endpoints';
import { storeAuth, clearAuth, DEV_TOKEN } from '../api/auth';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const FORCED_USERNAME = 'luilver_garces';
  const FORCED_EMAIL = 'luilver@gmail.com';
  const FORCED_PASSWORD = 'comida2026';
  const FORCED_ROLE = USER_ROLES.DELIVERY_BOY;
  const FORCED_USER_ID = '33000000-0000-0000-0000-000000000001';

  useEffect(() => {
    const init = async () => {
      try {
        // Force authentication to match the configured Delivery Boy user
        await storeAuth(DEV_TOKEN, {
          id: FORCED_USER_ID,
          username: FORCED_USERNAME,
          email: FORCED_EMAIL,
          role: FORCED_ROLE,
          isActive: true,
        });
        setToken(DEV_TOKEN);
        setUser({
          id: FORCED_USER_ID,
          username: FORCED_USERNAME,
          email: FORCED_EMAIL,
          role: FORCED_ROLE,
          isActive: true,
        });

        // Request geolocation and notification permissions per REQUERIMIENTOS §5
        await requestPermissions();
        await storeFcmTokenLocally();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const locStatus = await Location.requestForegroundPermissionsAsync();
      if (locStatus.granted !== true) {
        console.warn('Location permission not granted');
      }
      const notifStatus = await Notifications.requestPermissionsAsync();
      if (notifStatus.granted !== true) {
        console.warn('Notification permission not granted');
      }
    } catch (err) {
      console.warn('Permission request failed', err);
    }
  }, []);

  const storeFcmTokenLocally = useCallback(async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const fcmToken = await messaging().getToken();
      if (fcmToken && token) {
        await storeAuth(token, { ...user, fcmToken });
        setUser({ ...user, fcmToken });
        console.log('FCM token stored locally:', fcmToken);
      }
    } catch (err) {
      console.warn('Local FCM token storage failed', err);
    }
  }, [token, user]);

  const registerFcmToken = useCallback(
    async (authToken, userId, userData) => {
      try {
        await messaging().registerDeviceForRemoteMessages();
        const fcmToken = await messaging().getToken();
        if (!fcmToken) {
          console.warn('No FCM token obtained');
          return;
        }
        // Register FCM token with backend (per kevin_more_requirements)
        await api.patch(ENDPOINTS.security.fcmToken, { fcmToken, userId }, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const mergedUser = {
          ...userData,
          fcmToken,
        };
        await storeAuth(authToken, mergedUser);
        setToken(authToken);
        setUser(mergedUser);
        console.log('FCM token registered:', fcmToken);
      } catch (err) {
        console.warn('FCM registration failed', err);
      }
    },
    [],
  );

  const login = useCallback(async (username, password) => {
    if (!username || !password) {
      throw new Error('Por favor ingresa tu usuario y contraseña.');
    }
    const response = await api.post(ENDPOINTS.security.login, {
      username,
      password,
    });
    const data = response || {};
    const authToken = data.accessToken || data.token || DEV_TOKEN;
    const userData = data.user || {};
    const role = userData.role || FORCED_ROLE;
    await storeAuth(authToken, {
      username: userData.username || username,
      email: userData.email,
      role,
      isActive: userData.isActive !== false,
      marketId: userData.marketId,
      marketName: userData.marketName,
    });
    setToken(authToken);
    setUser({
      username: userData.username || username,
      email: userData.email,
      role,
      isActive: userData.isActive !== false,
      marketId: userData.marketId,
      marketName: userData.marketName,
    });

    // Register FCM token after login
    if (userData.id) {
      await registerFcmToken(authToken, userData.id, {
        username: userData.username || username,
        email: userData.email,
        role,
        isActive: userData.isActive !== false,
        marketId: userData.marketId,
        marketName: userData.marketName,
      });
    }

    return {
      username: userData.username || username,
      role,
      isActive: userData.isActive !== false,
      token: authToken,
    };
  }, [registerFcmToken]);

  const logout = useCallback(async () => {
    await clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const role = user ? user.role : null;
  const isDeliveryBoy = role === USER_ROLES.DELIVERY_BOY;
  const isSupervisor = role === USER_ROLES.SUPERVISOR;
  const isCentroAcoque = role === USER_ROLES.CENTRO_ACOQUE;

  const value = {
    token,
    user,
    role,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    isDeliveryBoy,
    isSupervisor,
    isCentroAcoque,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthError } from '../api/api';
