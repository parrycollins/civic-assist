# CivicGH Expo app

This is the **phone app**. You do not need Android Studio.

The Next.js site in the repo root is still the full web product (Road Assist, agency tools). This Expo app is the citizen slice: Home, Map, Report, Completed, Profile.

## Run on your phone (Expo Go)

1. Install **Expo Go** from the Play Store (Android) or App Store (iPhone).
2. In a terminal:

```bash
cd mobile
npm install
npx expo start
```

3. Scan the QR code with Expo Go (Android) or the Camera app (iPhone).

Phone and computer must be on the same Wi‑Fi. If the QR does not connect:

```bash
npx expo start --tunnel
```

## Run in a browser

```bash
cd mobile
npx expo start --web --port 43218
```

Then open [http://localhost:43218](http://localhost:43218).

## Demo login

| Role | Email | Password |
| --- | --- | --- |
| Citizen | `ama@civicgh.gh` | `civic2026` |
| Accra Metropolitan Assembly | `officer@ama.gov.gh` | `agency2026` |
| Department of Urban Roads | `roads@dur.gov.gh` | `agency2026` |

## What this app includes

- Home with live counts from the Greater Accra seed
- OpenStreetMap (no Google Maps key)
- Category-tile reports
- Completed-work archive (years without records stay at 0)
- Profile, recognition toggle, citizen verify / dispute

Agency dashboards and Road Assist routing stay on the web app.
