# CivicGH

CivicGH is a civic accountability app for Ghana. It connects three systems on one geographic record:

1. **Civic reporting** — citizens report problems with photos and approximate locations.
2. **Civic accountability** — agencies update status, upload before / during / after evidence, and are scored on resolution and citizen verification.
3. **Road Assist** — the same civic data overlays live routes so travellers can compare fastest, balanced, and best-condition options.

The map is a visual history of community problems and public-service work, not only a pinboard of complaints.

The interface uses a Ghana-inspired CivicGH visual system: deep green, spare gold, Plus Jakarta Sans, and a shared `src/theme` token set. Dark mode is available from Profile.

The **Completed Work** archive (`/completed`) is a public history of agency-completed and citizen-verified records, with before / during / after evidence, optional agency videos, recognition settings, and civic-impact totals counted from the live dataset — not invented figures.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:43217](http://localhost:43217).

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Citizen | `ama@civicgh.gh` | `civic2026` |
| Accra Metropolitan Assembly | `officer@ama.gov.gh` | `agency2026` |
| Department of Urban Roads | `roads@dur.gov.gh` | `agency2026` |

## What this MVP includes

- Full-screen interactive civic map of Greater Accra with clustering, filters, search, Near Me (approximate location only), heatmap, and completed-work layer
- Issue cards and a full complaint history with before / during / after evidence that is appended, never overwritten
- Citizen verification, dispute/reopen, and community confirmation that feeds road-condition confidence
- Road Assist: destination search, OSRM routing (with a local fallback), route comparison, flood-aware warnings, quick roadside reports, post-trip feedback, and layer toggles
- Agency dashboard, assigned-complaint map, status updates, evidence upload, performance stats, and a road-management view
- Privacy: no public phone/email; map pins and Near Me use approximated public locations

Routing uses [OSRM](https://project-osrm.org/) behind a small provider interface so the mapping backend can be swapped later. Geocoding prefers the built-in Accra place index, then Nominatim.

Data is stored in the browser for this MVP (Zustand + localStorage). Reset it from **Profile → Reset demo data**.

## Android Studio

The native citizen app lives in **`android/`**. Open that folder in Android Studio (File → Open), sync SDK 35, and run on an API 26+ device or emulator.

See [ANDROID.md](ANDROID.md) for the project layout, demo logins, and what is (and is not) in this first native slice. The web app above remains the full reference for Road Assist and agency tools.
