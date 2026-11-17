Prompt: "good" (bare confirmation = commit now). Primary prompts behind the work:
role-based navigation (delivery → OrdersList, vendor → Vendor) and adding inventory items from the product catalog instead of creating products, followed by the request to speed up development without rebuilding every time.

Timestamp: 2026-11-17T07:42:58-07:00

Summary: Split the pending work into six coherent commits. Point the API at the reachable local backend, add the iOS location usage description, add a vendor inventory flow that searches the catalog and POSTs /api/v1/inventories, route users straight to their role screen on login, add simulator/Metro workflow scripts with documentation, and record the unresolved VendorScreen scroll bug.

Files changed:
- src/api/api.js
- app.json
- src/screens/VendorScreen.js (new)
- src/components/EmptyState.js
- App.js
- src/api/endpoints.js
- src/hooks/useAuth.js
- src/screens/LoginScreen.js
- dev.sh (new)
- launch.sh (new)
- rebuild.sh (new)
- run.sh (new)
- kill.sh (new)
- docs/DEVELOPMENT.md (new)
- README.md
- TODO.md (new)

Commits:
- 772ba72 chore(api): point base URL at local backend
- 05c4226 chore(ios): add location usage description
- 2c6128f feat(vendor): add inventory items from the product catalog
- 0d6bd36 feat(auth): route users to their role screen after login
- 7c4ddc0 chore(dev): add simulator and Metro workflow scripts
- 7be6986 docs: record VendorScreen scroll issue

Verification: `npx expo lint` → 0 errors, 23 warnings. Native Debug build succeeded and the app launched on the iPhone 17 Pro simulator with no redbox. `./dev.sh -h` and `./rebuild.sh -h` print usage; `./dev.sh` reused the running Metro and relaunched the app. Secret scan of the staged diff found nothing.

Notes: app.json and src/api/api.js were pre-existing working-tree changes included at the user's commit confirmation; they are isolated in their own commits. The VendorScreen vertical-scroll bug remains unresolved and is tracked in TODO.md.
