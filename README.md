# Pantry App

Expo (SDK 58) React Native app for pantry/order management with role-based navigation.

## Stack

- Expo `~58.0.23`, React Native `0.88.1`, React `19.3.0`
- Expo Router-compatible stack navigation (`@react-navigation/native` + `stack`)
- `@react-native-async-storage/async-storage` for local auth token
- `@react-native-firebase/app` + `messaging` for FCM push tokens
- `expo-location`, `expo-notifications` (geolocation + push permissions)
- `expo-status-bar`, `react-native-safe-area-context`, `react-native-screens`

## Scripts

```
npm start        # expo start
npm run android  # expo run:android
npm run ios      # expo run:ios
npm run web      # expo start --web
npm run lint     # expo lint
```

## Project structure

```
App.js              # root navigator + auth gate
src/
  api/
    api.js          # axios instance + Bearer auth header
    auth.js         # token storage helpers
    endpoints.js    # API routes, user roles, order statuses
  components/       # Loading, EmptyState, ProductCard (theme-driven)
  hooks/
    useAuth.js      # auth context, forced dev login, FCM registration
  screens/          # Login, OrdersList, OrderDetail, DeliveryBoy, DeliveryMap, CentroAcoque, Supervisor
  theme/            # design tokens (colors, text, spacing, radius, makeStyles)
assets/brand/       # Prefud brand logos and isotypes
```

## Roles

Defined in `src/api/endpoints.js` (`USER_ROLES`): `superadmin`, `admin`, `delivery`, `vendor`, `supervisor`.

## Order statuses

`CREATED`, `PAID`, `PREPARING`, `PICKING_UP`, `DELIVERING`, `COMPLETED`, `CANCELLED` (`ORDER_STATUSES`).

## Authentication

`src/hooks/useAuth.js` forces a configured Delivery Boy user on mount (per requirements), requests location and notification permissions, and registers/stores the FCM token. Login posts to `/api/v1/auth/login`.

## API base

`src/api/api.js` points at `http://10.51.26.21:3002`.

## Branding

App icons/splash/notifications use `assets/brand/` (Prefud). Configured in `app.json` via the `expo-notifications`, `@react-native-firebase/app`, `@react-native-firebase/messaging`, and `expo-location` plugins.

## License

MIT
