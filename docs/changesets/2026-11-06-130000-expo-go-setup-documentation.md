Prompt: "Document it: I had to login both Expo Go app and Expo Go Cli (by npx expo login), and be sure to be in the same org (luilver-go)." Follow-up: user unable to use Expo Go, "There's no Enter URL manually" error, blank screen in browser, deliverer tap error.

Timestamp: 2026-11-06T13:00:00-06:00

Summary: Add EXPO_GO_SETUP.md documentation covering Expo Go authentication (sign in on both CLI and mobile app, same org luilver-go), LAN IP configuration, API base URL, and troubleshooting for connection errors and the deliverer navigation bug.

Files changed:
- EXPO_GO_SETUP.md

Commits:
- d66e6ab docs: add expo go setup documentation

Verification: Documentation reviewed for accuracy against observed errors.

Notes: Errors encountered during session:
1. pod install failed on iOS: missing i18n Ruby gem (unrelated to app code; Expo Go path doesn't require it)
2. SafeAreaView deprecated warning - fixed by migrating to react-native-safe-area-context
3. "undefined is not a function" on Deliverer tap - root cause: RoleSelectionScreen rendered inside Stack.Navigator without onSelectRole prop; fixed by using navigation.navigate(role) via screen component's navigation prop
4. Expo Go sign-in required on both CLI and app, same org
5. Blank screen in browser was stale Metro bundle cache - fixed with --clear and reload