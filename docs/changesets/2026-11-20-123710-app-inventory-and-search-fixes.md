# Changeset: 2026-11-20 12:37:10

## Prompt
commit

## Additional prompts
- There's no such agregar productos nuevos. Products should be search from our catalog and they would be able to add stock price and stock quantity
- Answer to "Where should price + stock quantity be saved?": `Inventory + new stockQty (Recommended)`
- Answer to "Which vendor/stall's inventory does Centro de Acoque manage?": `User picks a vendor (Recommended)`
- create a development branch within backend. then commit only this changeset
- add quantity to Inventario - proveeedor
- Inventario - Proveedro no se guardan las cantidades
- continue
  bug: once clicked on search there si no way to fold search results. Esc or tap on another area should

## Timestamp
2026-11-20T12:37:10-0700

## Summary
Grouped the pending app work into coherent commits: dynamic API host resolution, shared BackButton/OptionPicker UI components, centralized auth routing, catalog-based vendor inventory management in Centro de Acoque, and stock quantity editing in Inventario — Proveedor. The quantity-only save bug and the search-results collapse bug were fixed before committing.

## Files changed
- `src/api/api.js`
- `src/components/BackButton.js`
- `src/components/OptionPicker.js`
- `App.js`
- `src/screens/LoginScreen.js`
- `src/screens/DeliveryBoyScreen.js`
- `src/screens/DeliveryMapScreen.js`
- `src/screens/OrderDetailScreen.js`
- `src/screens/OrdersListScreen.js`
- `src/screens/SupervisorScreen.js`
- `src/screens/CentroAcoqueScreen.js`
- `src/screens/VendorScreen.js`

## Commits
- `1e27447d845e6937ff5a8294b031037aae9a5967` chore(api): resolve backend host from Metro script URL
- `18f8b881b6636c7e7a8dbe9db5c9bcb6bcbb3297` refactor(ui): add shared BackButton and OptionPicker
- `5b316303a4e7ba82b6ee4293276228ad4a66eaf6` refactor(navigation): centralize role routing in App
- `76399310c94c4fb58e5c0e901ce8b98455ef7fa2` feat(centro): manage vendor inventory from catalog search
- `de1133f7220e205b8ea04bf87f91d378e6665460` feat(vendor): save stock quantity per inventory item

## Verification
- `npx expo lint` — 0 errors, 20 warnings (pre-existing)
- Local import/export checker — PASS
- Metro bundle `http://localhost:8081/index.bundle?platform=ios&dev=true` — HTTP 200
- Quantity-only UI harness — PASS (`PATCH_BODY {"stockQty":42.5}`)
- Price-only UI harness — PASS (`{"price":9.99}`)
- Backend persistence loop — PASS (`PERSISTED_QTY 77.777`)
- Search collapse loop — PASS for `VendorScreen.js` and `CentroAcoqueScreen.js`
- Secret scan of each staged diff — clean

## Notes
- Branch: `master`; not pushed.
- Backend stockQty work was committed separately in `pantry-ms-ecommerce-ec` on branch `development`.
- Pre-existing working-tree changes were grouped into their own UI/navigation commits instead of being mixed into the inventory features.
- Verification ran against the final working tree; commits were staged in dependency order so each leaves the tree buildable.
