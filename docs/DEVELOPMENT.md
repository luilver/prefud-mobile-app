# Development workflow

The rule: **only rebuild natively when native things change.** For normal JS/JSX
work, Metro + Fast Refresh updates the app in about a second.

## The loop (99% of work)

1. Keep Metro running (`./dev.sh` starts it for you, or `./run.sh` in its own terminal).
2. Edit a file in `src/` or `App.js` and save.
3. Fast Refresh applies the change. No `xcodebuild`, no reinstall.
4. If it does not refresh, press `r` in the Metro terminal or `Cmd+R` in the simulator.

## Commands

| Command | What it does | Rebuilds? |
|---|---|---|
| `./dev.sh` | Boots the simulator if needed, starts Metro if needed, launches the app | No |
| `./launch.sh` | Alias for `./dev.sh` (kept for habit) | No |
| `./run.sh` | Starts Metro in the foreground only | No |
| `./kill.sh` | Stops Metro/Expo dev servers | — |
| `./rebuild.sh` | Native Debug build, install, launch | **Yes** |
| `npx expo start --web` | Web target in the browser (fastest for layout work) | No |

All scripts accept `-h` / `--help`.

## When a native rebuild is actually required

- Added or upgraded a native dependency (`npx expo install <pkg>`).
- Changed `app.json` — plugins, permissions, icons, bundle id, splash.
- Edited anything under `ios/` or `android/`.
- Cleaned build output or the app is not installed on the simulator.

Then run `./rebuild.sh` once and resume the Fast Refresh loop.

## Environment

| Thing | Value |
|---|---|
| Simulator | iPhone 17 Pro — `68E02AFC-0BB5-43DD-8E19-6B26B91B9156` |
| Bundle id | `com.luilver-go.pantry-app` |
| Metro | `http://localhost:8081` |
| Metro log | `/tmp/pantry/metro.log` (when started by `dev.sh`) |
| Build logs | `/tmp/pantry/xcodebuild-<timestamp>.log` |

Override any of these with `DEVICE_UDID`, `DEVICE_NAME`, `BUNDLE_ID`, `METRO_PORT`.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `No devices are booted` | No simulator running | `./dev.sh` boots it; or `xcrun simctl boot <UDID>` |
| Redbox `No bundle URL present` / can't connect | Metro not running | `./dev.sh` or `./run.sh` |
| `App … is not installed` | App was erased / never installed | `./rebuild.sh` |
| Change not showing | Fast Refresh missed it | `Cmd+R` in the simulator, or `r` in Metro |
| Metro port busy | Another Metro instance | Reuse it, or `./kill.sh` then `./dev.sh` |
| Native module missing / crash after install | Native dependency added | `./rebuild.sh` |

## API backend

`src/api/api.js` points at the NestJS backend (`http://10.0.250.176:3002` unless
overridden). The simulator reaches the Mac's network directly, so the host must
be reachable from the simulator.
