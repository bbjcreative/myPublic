# Changelog

All notable changes to **myPublic** are recorded here.
Format: `[version] YYYY-MM-DD — description`

---

## [0.3.0] 2026-05-31 — Onboarding flow, Firebase Auth, Firestore saved routes, Profile tab

### Added
- `apps/mobile/src/screens/OnboardingScreen.tsx` — 3-slide feature tour (real-time transit, route planning, JPJ check) → language picker (EN/BM) → location permission request; shown on first launch only via `onboardingDone` flag
- `apps/mobile/src/store/authStore.ts` — Zustand store for Firebase Auth state (`user`, `loading`); fed by `auth().onAuthStateChanged` listener in `App.tsx`
- `apps/mobile/src/services/firestoreRoutes.ts` — Firestore CRUD: `subscribeToSavedRoutes` (real-time listener), `addRouteToCloud`, `removeRouteFromCloud`, `bulkUploadRoutes` (batch on first sign-in)
- `apps/mobile/src/services/googleSignIn.ts` — Google Sign-In via `@react-native-google-signin/google-signin` v13 + Firebase Auth credential; handles `cancelled` response type; `signOutGoogle` clears both Google session and Firebase
- `apps/mobile/src/hooks/useSavedRoutes.ts` — unified saved routes hook: local AsyncStorage when guest, Firestore real-time when signed in; auto-bulk-uploads local routes on first sign-in; `add`/`remove` write to both local and cloud atomically

### Changed
- `apps/mobile/src/screens/SavedRoutesScreen.tsx` — full redesign as Profile tab: signed-out state shows Google sign-in card; signed-in state shows user avatar/name/email + cloud sync badge + sign-out button; routes list sourced from `useSavedRoutes` hook
- `apps/mobile/src/navigation/RootNavigator.tsx` — added `Onboarding` route; `initialRouteName` controlled by `onboardingDone` from `prefsStore`; `RootStackParamList` extended with `Onboarding`
- `apps/mobile/src/App.tsx` — store hydration wait (renders blank until AsyncStorage resolves, prevents Onboarding flash for returning users); Firebase Auth state listener; `configureGoogleSignIn()` called at app start
- `apps/mobile/src/store/prefsStore.ts` — added `onboardingDone: boolean` + `setOnboardingDone` action
- `apps/mobile/src/constants/i18n.ts` — added 24 onboarding + auth strings in EN and BM: slide titles/descs, language picker, location permission, sign-in, sign-out, sync badge
- `apps/mobile/package.json` — added `@react-native-firebase/auth ^20.5.0`, `@react-native-firebase/firestore ^20.5.0`, `@react-native-google-signin/google-signin ^13.0.0`
- `apps/mobile/app.json` — added `@react-native-firebase/crashlytics` plugin; added `@react-native-google-signin/google-signin` plugin with `iosUrlScheme` placeholder
- `apps/mobile/src/components/common/MaintenanceScreen.tsx` — fixed brand text: `TM` → `MP`

### Pending (requires user action)
- Replace `REPLACE_WITH_WEB_CLIENT_ID` in `googleSignIn.ts` (Firebase Console → Project Settings → Web App client ID)
- Replace `REPLACE_WITH_REVERSED_CLIENT_ID` in `app.json` (from `GoogleService-Info.plist`)
- Enable Firestore in Firebase Console
- Run `npm install`, then `eas project:init`, then `eas build --profile preview --platform android`

---

## [0.2.0] 2026-05-31 — App management layer: Firebase, EAS Update, Privacy Policy

### Added
- `apps/mobile/src/services/remoteConfig.ts` — Firebase Remote Config with defaults: maintenance mode, force update (version gate), ads kill switch, interstitial cooldown override
- `apps/mobile/src/components/common/ErrorBoundary.tsx` — React error boundary that records crashes to Firebase Crashlytics
- `apps/mobile/src/components/common/ForceUpdateModal.tsx` — Non-dismissible modal shown when remote config requires a minimum app version; opens Play Store / App Store
- `apps/mobile/src/components/common/MaintenanceScreen.tsx` — Full-screen maintenance mode screen controlled by remote config
- `apps/mobile/eas.json` — EAS build profiles: development (dev client), preview (internal APK), production (AAB + iOS); submit config for Google Play internal track and App Store
- `privacy-policy/index.html` — PDPA 2010-compliant privacy policy covering GPS, FCM tokens, JPJ data, AdMob, Firebase, AWS; hosted at repo `privacy-policy/` for GitHub Pages

### Changed
- `apps/mobile/src/App.tsx` — integrated Firebase Analytics (auto screen tracking via NavigationContainer), Remote Config initialisation, force update + maintenance gate, ErrorBoundary wrapper
- `apps/mobile/package.json` — added `@react-native-firebase/app`, `analytics`, `crashlytics`, `remote-config`; `expo-application` (version reads); `expo-updates` (OTA)
- `apps/mobile/app.json` — added `updates` + `runtimeVersion` config for EAS Update; `@react-native-firebase/app` + `expo-updates` plugins; `android.googleServicesFile` pointer
- `.env.example` — replaced real Maps API key with placeholder (key was exposed in git; revoked and rotated)

## [0.1.2] 2026-05-30 — Google Maps API key wired in

### Added
- `apps/mobile/ios/myPublic/AppDelegate.mm` — iOS app delegate calling `[GMSServices provideAPIKey:]` before React Native bridge init (required by react-native-maps)

### Changed
- `apps/mobile/android/app/src/main/AndroidManifest.xml` — added `com.google.android.geo.API_KEY` meta-data with real Maps key
- `.env.example` — `MAPS_API_KEY` set to real value

---

## [0.1.1] 2026-05-30 — AdMob App IDs wired in

### Added
- `apps/mobile/android/app/src/main/AndroidManifest.xml` — full Android manifest with real AdMob App ID (`ca-app-pub-5181607198940787~2782126917`), `DELAY_APP_MEASUREMENT_INIT`, location permissions
- `apps/mobile/ios/myPublic/Info.plist` — full iOS plist with real AdMob App ID (`ca-app-pub-5181607198940787~9879382689`), `GADDelayAppMeasurementInit`, ATT usage string, SKAdNetwork entries, location strings

### Changed
- `apps/mobile/app.json` — replaced `$(ADMOB_APP_ID_*)` env var placeholders with real App IDs in both `infoPlist` and plugin config
- `.env.example` — updated AdMob App ID placeholders to real values

---

## [0.1.0] 2026-05-30 — Phase 3 Complete: Full MVP Scaffold

### Added

#### Infrastructure (AWS CDK)
- `infrastructure/lib/transit-stack.ts` — root CDK stack wiring all constructs
- `infrastructure/lib/dynamodb-construct.ts` — 4 DynamoDB tables: `mypublic-stops`, `mypublic-routes`, `mypublic-users`, `mypublic-alerts`; GSIs for geohash, agency/name, route short name, alert status
- `infrastructure/lib/s3-construct.ts` — GTFS cache bucket with 30-day lifecycle rule
- `infrastructure/lib/lambda-construct.ts` — 5 Lambda functions with Function URLs (replaces API Gateway, saves $1–3.50/M requests)
- `infrastructure/lib/cloudfront-construct.ts` — CloudFront distribution with path-based routing to Lambda Function URLs and S3
- `infrastructure/lib/eventbridge-construct.ts` — weekly EventBridge cron (Sunday 02:00 UTC) triggering GTFS poller
- `infrastructure/bin/app.ts` — CDK app entry point targeting `ap-southeast-1`

#### Lambda: Shared Layer (`packages/lambdas/shared/`)
- `db.ts` — DynamoDB DocumentClient singleton with connection reuse
- `errors.ts` — `ApiError` class, typed JSON error/success response builders
- `validation.ts` — Malaysia-aware validators: plate sanitiser, IC validator, lat/lon bounds check (Malaysia bounding box), radius clamp
- `types.ts` — shared domain types: `Stop`, `Route`, `TripLeg`, `TripOption`, `VehiclePosition`, `AlertRecord`

#### Lambda: `gtfs-poller`
- `fetcher.ts` — downloads GTFS static ZIP from `api.data.gov.my` for all 3 agencies (prasarana, ktmb, bas_my)
- `parser.ts` — parses `stops.txt`, `routes.txt`, `trips.txt`, `stop_times.txt`; computes geohash-4 for each stop; back-populates route lists onto stops
- `writer.ts` — batch-writes stops and routes to DynamoDB (25-item chunks), caches raw CSVs to S3, writes poll metadata; 8-day TTL on all records

#### Lambda: `realtime-proxy`
- `fetcher.ts` — fetches GTFS-RT protobuf feed from `api.data.gov.my/gtfs-realtime/vehicle-position/prasarana`
- `decoder.ts` — decodes protobuf via `gtfs-realtime-bindings`, maps occupancy enum to string, converts speed m/s → km/h
- `index.ts` — Function URL handler; supports `?agency=` and optional `?route_id=` filter

#### Lambda: `trip-planner`
- `graph.ts` — builds in-memory transit graph from DynamoDB; computes walk times between nodes; `findNearestStops` returns up to 5 stops within 800m of origin/destination
- `dijkstra.ts` — modified Dijkstra with per-edge cost function; extends contiguous same-route legs instead of creating separate nodes; handles walk legs at origin and destination
- `formatter.ts` — runs 3 Dijkstra variants (fastest / least-walking / cheapest); deduplicates by duration+fare fingerprint; returns up to 3 `TripOption` objects
- `index.ts` — validates request body; returns `NO_ROUTE_FOUND` 404 when graph finds no path

#### Lambda: `jpj-proxy`
- `summons.ts` — wraps `mygdx.gov.my` summons API; maps response to typed `SummonsRecord[]`; computes total outstanding
- `demerit.ts` — wraps JPJ demerit API; computes `points_remaining` from 20-point max; maps licence status enum
- `index.ts` — routes `/jpj/summons` and `/jpj/demerit`; in-memory rate limiter (10 req/60s per Lambda instance)

#### Lambda: `notification-dispatcher`
- `templates.ts` — BM + EN alert message builder by severity level
- `index.ts` — handles `/alerts/subscribe` (writes FCM token + route subscriptions to DynamoDB) and `/alerts/dispatch` (writes alert, publishes to SNS topic with GCM + APNS message structure)

#### React Native App (`apps/mobile/`)
- **Entry**: `index.js`, `src/App.tsx` — ATT permission prompt before AdMob init (Apple requirement); React Query client with 30s stale time default
- **Navigation**: `RootNavigator` (stack: tabs + fullscreen `NavigationModal`), `BottomTabNavigator` (5 tabs), `HomeStack`, `PlanStack`, `JPJStack`
- **Screens**: `HomeScreen`, `NearbyStopsScreen`, `RoutePlannerScreen`, `RouteResultsScreen`, `RouteDetailScreen`, `NavigationScreen` (NO ADS), `AlertsScreen`, `JPJCheckerScreen`, `SavedRoutesScreen`, `SettingsScreen`
- **Components**: `AdBanner`, `AdContext` (enforces ad visibility rules per screen), `TransitMap`, `VehicleMarker`, `StopMarker`, `TradeoffCard`, `LegStep`, `GetOffAlert` (modal), `SummonsCard`, `DemeritBadge`, `StopCard`, `RouteChip`, `LoadingOverlay`, `ErrorBanner`, `LanguageToggle`
- **Hooks**: `useLocation`, `useNearbyStops`, `useVehiclePositions` (15s refetch), `useTripPlan`, `useGetOffAlert` (haversine geofence + haptic trigger), `useInterstitialAd` (3-min cooldown, auto-reload), `useRewardedAd` (1-hour ad-free grant)
- **Store**: `locationStore` (Zustand, in-memory GPS), `prefsStore` (Zustand + AsyncStorage persisted: lang, saved routes, ad-free expiry), `navigationStore` (active trip, current leg, get-off stop)
- **Services**: `api.ts` (Axios instance + error interceptor), `gtfs.ts`, `jpj.ts`
- **Constants**: `colors.ts` (light/dark + mode colours), `adUnits.ts` (`__DEV__` → TestIds switch), `i18n.ts` (BM + EN string map, `t()` helper)
- **Types**: `gtfs.ts`, `jpj.ts`, `api.ts` (mirrors Phase 1 API contracts)

#### CI/CD (`.github/workflows/`)
- `pr-checks.yml` — TypeScript check + lint + Lambda build on every PR to `main`
- `lambda-deploy.yml` — CDK deploy on merge to `main` (paths: `packages/lambdas/**`, `infrastructure/**`); uses OIDC role assumption (no long-lived AWS keys)
- `mobile-build.yml` — EAS Android build on merge to `main` (paths: `apps/mobile/**`)

---

## [0.0.1] 2026-05-30 — Project Initialisation

### Added
- Phase 1: System architecture, DynamoDB schema, API contracts, UI component hierarchy
- Phase 2: Full monorepo file structure, dependency manifests for all 8 workspaces
- `sources/app_brief_agent.md` — product discovery document (mission, competitive analysis, API strategy, monetisation plan, roadmap)
- `agent.yaml` — Principal Full-Stack Engineer agent ruleset (3-phase pipeline, no placeholders, explicit trade-off logging)
