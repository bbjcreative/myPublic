# AI Agent Handover Document
## Project: TransitMY — Malaysia Public Transit App
**Last updated:** 2026-05-30
**Session status:** Phase 3 complete. Code written. Nothing deployed yet.
**Repository:** https://github.com/bbjcreative/myPublic

---

## 1. What This Project Is

A free, ad-supported Malaysian public transportation app for Android and iOS. Revenue from AdMob only (Banner + Interstitial + Rewarded Video). No paywalls, no premium tiers.

**Core features (MVP):**
- Multi-modal route planning (LRT + Bus + KTM) with 3 trade-off options: fastest / least walking / cheapest
- Live vehicle positions on map (15s refresh)
- Get-off haptic alert when approaching destination stop
- Nearby stops with next departures
- JPJ summons checker + demerit points checker
- Offline-capable (cached GTFS data in DynamoDB + S3)
- Bilingual: English + Bahasa Malaysia

**What is explicitly NOT in MVP:**
- AR stop finder (Phase 2)
- Grab / TnG affiliate deep-links (Phase 2)
- Apple App Store build — only Android is in CI right now
- Full address search in trip planner (currently uses hardcoded coordinates)

---

## 2. Repository Layout

```
transit-my/
├── apps/mobile/            React Native (Expo bare) — the user-facing app
├── packages/lambdas/
│   ├── shared/             Shared DynamoDB client, error types, validators
│   ├── gtfs-poller/        Weekly job: fetches GTFS zip → DynamoDB + S3
│   ├── realtime-proxy/     Live vehicle positions (GTFS-RT protobuf → JSON)
│   ├── trip-planner/       Multi-modal Dijkstra route engine
│   ├── jpj-proxy/          JPJ summons + demerit API wrapper
│   └── notification-dispatcher/  SNS alert dispatch + FCM subscription
├── infrastructure/         AWS CDK v2 (TypeScript) — all cloud resources
└── .github/workflows/      PR checks, Lambda deploy, EAS mobile build
```

All packages are npm workspaces. Run everything from `transit-my/` root.

---

## 3. Tech Stack (do not change without explicit instruction)

| Layer | Choice | Reason |
|---|---|---|
| Mobile | React Native, Expo bare workflow | AdMob + Google Maps need native modules |
| State | Zustand (in-memory) + Zustand + AsyncStorage (persisted) | Lightweight, excellent DX |
| Data fetching | React Query v5 (`@tanstack/react-query`) | Polling, caching, mutations |
| Maps | `react-native-maps` with Google Maps SDK | Best Malaysia coverage |
| Ads | `react-native-google-mobile-ads` | Latest maintained AdMob SDK |
| Backend | AWS Lambda Function URLs (NOT API Gateway) | Saves $1–3.50/M requests |
| Database | DynamoDB (PAY_PER_REQUEST) | 25GB free tier, 200M req/month |
| Storage | S3 | GTFS cache, map tiles |
| CDN | CloudFront | Fast delivery, origin key protection |
| IaC | AWS CDK v2 TypeScript | Same language as Lambdas |
| CI/CD | GitHub Actions + EAS Build | No local Xcode/Gradle needed |

---

## 4. Current State — What Exists

### Written and on disk ✅
105 files across all layers. Every file has real logic — no placeholder comments.

### NOT yet done ⬜
- `npm install` has not been run — no `node_modules`
- AWS infrastructure has not been deployed (`cdk deploy` not run)
- No `.env` file exists — user must copy `.env.example` and fill values
- GTFS data has never been polled — DynamoDB tables are empty
- No EAS project ID set — `app.json` has `"REPLACE_WITH_EAS_PROJECT_ID"`
- No AdMob account created — all ad unit IDs are placeholder
- iOS native config (`Info.plist`) is present but incomplete — no real AdMob app ID
- `AndroidManifest.xml` exists as a path reference but the file content was not written — see Section 6
- Full address search in `RoutePlannerScreen` is hardcoded (KL Sentral → Putrajaya Sentral) pending geocoding integration

---

## 5. How to Resume Development

### Step 1 — Install dependencies
```bash
cd transit-my
npm install
```

### Step 2 — Fill environment variables
```bash
cp .env.example .env
# Fill in: MAPS_API_KEY, ADMOB_*, AWS_ACCOUNT_ID, DATA_GOV_MY_API_KEY
```

### Step 3 — Deploy cloud infrastructure
```bash
# Requires AWS CLI configured with sufficient IAM permissions
npm run deploy:infra
# Note the CloudFront domain from CDK output → set as LAMBDA_BASE_URL in .env
```

### Step 4 — Seed GTFS data (first time only)
Invoke the `transit-gtfs-poller` Lambda manually from the AWS console or CLI.
This seeds stops and routes into DynamoDB. The weekly EventBridge cron takes over after that.

### Step 5 — Run the mobile app
```bash
npm run mobile
# Then press 'a' for Android or 'i' for iOS in Metro
```

---

## 6. Known Gaps to Complete

These are real missing pieces — not design decisions, but unfinished work:

| Gap | File to create/edit | What to do |
|---|---|---|
| ~~`AndroidManifest.xml`~~ | ✅ Done 2026-05-30 | Real AdMob App ID wired, permissions, delay init flag set |
| ~~`Info.plist`~~ | ✅ Done 2026-05-30 | Real AdMob App ID, ATT string, SKAdNetwork entries, location strings |
| EAS `eas.json` missing | `apps/mobile/eas.json` | Create production build profile |
| Address geocoding | `apps/mobile/src/screens/RoutePlannerScreen.tsx` | Replace hardcoded KL Sentral/Putrajaya with a text search + geocode flow (Google Places API or Nominatim) |
| Stops `/stops/nearby` Lambda | Not yet written | The mobile app calls `/stops/nearby` but no Lambda handles this route yet — needs a new Lambda or extension of `realtime-proxy` |
| Trip planner: time-aware routing | `packages/lambdas/trip-planner/src/graph.ts` | Current implementation ignores `depart_at` — for production, filter trips by `service_id` (calendar.txt) and time window |
| DynamoDB graph scan (2000 stop limit) | `packages/lambdas/trip-planner/src/graph.ts` | Replace `ScanCommand` with geohash GSI query for bounding box around origin/destination |

---

## 7. Critical Business Rules (never violate these)

1. **NO ads on `NavigationScreen`** — safety violation + Google Play Store policy. Enforced by `AdContext` with value `NEVER`. Do not change.
2. **No interstitial on app launch** — only show after user completes an action (e.g. viewing route results).
3. **Max 1 interstitial per 3 minutes per session** — enforced in `useInterstitialAd.ts` via `MIN_INTERVAL_MS`.
4. **ATT prompt before AdMob init on iOS** — Apple will reject the app if you call `mobileAds().initialize()` first. Order is hardcoded in `App.tsx`.
5. **Always use `TestIds` in `__DEV__` mode** — switching to real AdMob IDs in dev causes policy violations. Enforced in `constants/adUnits.ts`.
6. **JPJ rate limit** — `jpj-proxy` has a 10 req/60s in-memory rate limit to avoid overwhelming the government API.

---

## 8. Data Flow Summary

```
User opens app
  → useLocation() requests GPS permission
  → useNearbyStops() queries GET /stops/nearby (CloudFront → Lambda)
  → TransitMap renders stops + vehicles from GTFS-RT

User taps search → RoutePlannerScreen
  → useTripPlan() POST /trip/plan
  → trip-planner Lambda: reads stops+routes from DynamoDB → Dijkstra → 3 options
  → RouteResultsScreen shows TradeoffCards
  → User selects → interstitial ad shown (if eligible)
  → RouteDetailScreen shows leg-by-leg

User starts navigation → NavigationScreen (NO ADS)
  → useGetOffAlert() watches GPS via expo-location
  → Haversine distance to getOffStopId
  → When within 300m → haptic vibration + GetOffAlert modal

GTFS data freshness:
  EventBridge (Sunday 02:00 UTC)
  → gtfs-poller Lambda
  → Downloads ZIP from api.data.gov.my
  → Parses CSV → DynamoDB + S3 (8-day TTL)
```

---

## 9. Secrets Required (GitHub Actions)

| Secret name | Where to get it |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | AWS IAM — create OIDC role for GitHub Actions |
| `AWS_ACCOUNT_ID` | ✅ `339712939731` |
| ~~`DATA_GOV_MY_API_KEY`~~ | Not needed — data.gov.my Open API requires no token |
| `SNS_ALERTS_TOPIC_ARN` | CDK output after first deploy |
| `EXPO_TOKEN` | https://expo.dev — account settings |
| `ADMOB_APP_ID_ANDROID` | AdMob console |
| `ADMOB_BANNER_ANDROID` | AdMob console |
| `ADMOB_INTERSTITIAL_ANDROID` | AdMob console |
| `ADMOB_REWARDED_ANDROID` | AdMob console |
| `MAPS_API_KEY` | Google Cloud Console (enable Maps SDK for Android + iOS) |
| `LAMBDA_BASE_URL` | CDK output → CloudFront distribution domain |
| `API_ORIGIN_KEY` | Generate a random string, set in CloudFront origin custom header |

---

## 10. Agent Operating Rules

This project was bootstrapped under `agent.yaml` which defines a 3-phase pipeline:

- **Phase 1: Architecture & Design** ✅ Complete
- **Phase 2: Scaffolding** ✅ Complete
- **Phase 3: Implementation** ✅ Complete (105 files)

**If you are continuing this work, follow these rules from `agent.yaml`:**
- Write full, un-truncated files — no placeholder comments like `// logic goes here`
- State trade-offs explicitly before making architectural decisions
- Do not jump to implementation without confirming scope if the task is ambiguous
- The next logical tasks are in Section 6 (Known Gaps) above

**Suggested next session priorities (in order):**
1. Write `AndroidManifest.xml` and complete `Info.plist`
2. Write `apps/mobile/eas.json` build profile
3. Implement `/stops/nearby` Lambda (most critical — mobile home screen depends on it)
4. Fix trip planner DynamoDB scan → geohash bounding box query
5. Add address search/geocoding to `RoutePlannerScreen`

---

## 11. Key File Reference

| What you're looking for | File |
|---|---|
| AWS resource definitions | `infrastructure/lib/*-construct.ts` |
| API endpoint contracts | See Phase 1 in `sources/app_brief_agent.md` Section 3, or infer from Lambda `index.ts` files |
| Ad unit IDs (dev/prod switch) | `apps/mobile/src/constants/adUnits.ts` |
| Ad placement rules (which screens show what) | `apps/mobile/src/components/ads/AdContext.tsx` + each screen's `<AdProvider visibility="...">` |
| BM/EN string translations | `apps/mobile/src/constants/i18n.ts` |
| Zustand stores | `apps/mobile/src/store/*.ts` |
| Route/screen type params | `apps/mobile/src/navigation/*.tsx` — each exports a `*ParamList` type |
| DynamoDB key schema | `infrastructure/lib/dynamodb-construct.ts` + `packages/lambdas/shared/types.ts` |
| Environment variables (full list) | `.env.example` |

---

*This document should be updated at the end of every development session.*
