# TODO

## Bugs

- [ ] **Vendor screen cannot scroll (iPhone & web)**
  - **Symptoms:** On VendorScreen ("Inventario — Proveedor"), user cannot scroll up/down after adding a product ("Producto agregado" shown but product not visible; view stuck).
  - **Context:** Reported in vendor flow (vendor login → Role Selection → "Gestionar inventario"). Affects both iOS simulator and web.
  - **Fixes attempted:**
    - Unwrapped paginated `GET /api/v1/products` response (`{items: [...]}`) so catalog products render correctly.
    - Replaced non-scrollable layout with `ScrollView` (`flex: 1`, `contentContainerStyle`) and mapped lists instead of nested `FlatList`s.
    - Removed nested `KeyboardAvoidingView` from inside `ScrollView`; added `keyboardShouldPersistTaps="handled"`.
    - Updated `EmptyState` to accept `style` prop and set `style={{ flex: 0 }}` for VendorScreen empty states (default `EmptyState` uses `flex: 1` for full-screen centering, which can break scrolling inside a `ScrollView`).
  - **Status:** Rebuilt/reinstalled on iOS (latest build succeeded, no crashes in logs) but user reports scrolling still not working on iPhone nor web. Needs further investigation (content height/overflow, web scroll container/touch handling, SafeAreaView/ScrollView nesting, platform-specific behavior).
  - **Files:** `src/screens/VendorScreen.js`, `src/components/EmptyState.js`
