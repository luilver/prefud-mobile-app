# Pantry Mobile — React Native App

React Native front-end for the Prefud Ecuador e-commerce backend (`pantry-ms-ecommerce-ec`). Built with Expo.

## User Roles

The app supports 4 user types, each with its own dashboard:

| Role | Dashboard | Backend endpoints consumed |
|------|-----------|---------------------------|
| **Deliverer** | Deliverer list & tracking | `GET /api/v1/deliverers` |
| **Supervisor** | Markets + orders overview | `GET /api/v1/markets`, `GET /api/v1/orders` |
| **Logistic** | Vendors + inventory stock | `GET /api/v1/vendors`, `GET /api/v1/inventories` |
| **Provider** | Products catalog | `GET /api/v1/products` |

## Prerequisites

- Node.js + npm/yarn
- Expo CLI: `npx expo --version`
- NestJS backend running on `http://10.51.26.21:3002` (the Mac's LAN IP)
- Phone and Mac on the **same WiFi network**

## Expo Go Setup (required)

Expo Go now requires authentication. You must be logged in on **both** the phone app and the CLI, in the **same org**.

### 1. Log in to Expo CLI (on the Mac)

```bash
cd /Users/luilver/projects/Kevin/pantry-app
npx expo login
```

Use the account that belongs to org **`luilver-go`**.

### 2. Log in to Expo Go (on the phone)

1. Open the Expo Go app.
2. Sign in with the **same Expo account** (org `luilver-go`).
3. Without signing in on both sides, the connection will fail.

### 3. Verify same org

Ensure both the CLI session and the phone app are under the org `luilver-go`. Mismatched orgs cause connection errors even when both are logged in.

## Running the App

### Start the backend (NestJS)

From the backend project:

```bash
cd /Users/luilver/projects/Kevin/pantry-ms-ecommerce-ec
yarn start        # builds + starts on http://localhost:3002
```

The API is reachable on the LAN at `http://10.51.26.21:3002`.

### Start the Expo dev server

```bash
cd /Users/luilver/projects/Kevin/pantry-app
npx expo start --host lan --port 8081
```

### Connect from the phone

1. Open Expo Go (signed in to `luilver-go`).
2. Scan the QR code shown in the terminal, **or**
3. In Expo Go, enter the URL manually: `exp://10.51.26.21:8081`
4. Tap **Connect**.

## API Configuration

`src/api/api.js` points the app at the backend:

```js
const API_BASE_URL = 'http://10.51.26.21:3002';
```

If the Mac's LAN IP changes, update this constant and restart the dev server.

## Project Structure

```
App.js                      # Entry: role selection + stack navigation
src/api/api.js              # Fetch client (base URL + timeout)
src/api/endpoints.js        # Backend endpoint constants + role definitions
src/components/RoleSelector.js   # 4 role choice cards
src/components/ProductCard.js    # Product list item
src/components/Loading.js        # Loading indicator
src/components/EmptyState.js     # Empty / error state
src/screens/ProviderScreen.js    # Products catalog
src/screens/DelivererScreen.js   # Deliverer list
src/screens/SupervisorScreen.js  # Markets + orders
src/screens/LogisticScreen.js    # Vendors + inventory
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "No usable data found" on QR scan | Make sure Expo CLI and phone are both logged in to org `luilver-go` |
| Connection refused | Phone and Mac on same WiFi; no VPN/cellular; Mac firewall not blocking port 8081 |
| API calls fail | Confirm `http://10.51.26.21:3002` is reachable from the phone; backend running |
| Blank screen | Refresh the Expo Go session; check Metro logs for bundling errors |

## Alternative (no Expo Go)

Open `http://10.51.26.21:8081` in your phone's browser to run the web build — no Expo account needed.
