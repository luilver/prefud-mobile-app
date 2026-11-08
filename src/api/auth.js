import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@pantry:auth_token';
const USER_KEY = '@pantry:auth_user';

// Simulated dev token accepted by the target API's Bearer auth scheme
// (documented in its OpenAPI: "Input Firebase ID token or simulated dev token
// (e.g. dev-token-ADMIN-01)"). The remote server exposes no /security/login
// endpoint, so this is used to authorize requests instead of a password flow.
export const DEV_TOKEN = 'dev-token-ADMIN-01';

export const storeAuth = async (token, user = null) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  if (user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getToken = async () => AsyncStorage.getItem(TOKEN_KEY);

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearAuth = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};

export const getAuthHeader = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
