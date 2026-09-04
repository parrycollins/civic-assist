# CivicGH

CivicGH is a civic accountability app for Ghana. It connects three systems on one geographic record:

1. **Civic reporting** — citizens report problems with photos and approximate locations.
2. **Civic accountability** — agencies update status, upload before / during / after evidence, and are scored on resolution and citizen verification.
3. **Road Assist** — the same civic data overlays live routes so travellers can compare fastest, balanced, and best-condition options.

The map is a visual history of community problems and public-service work, not only a pinboard of complaints.

## Phone app (Expo)

You do **not** need Android Studio. The citizen app is in **`mobile/`**.

```bash
cd mobile
npm install
npx expo start
```

Install [Expo Go](https://expo.dev/go) on your phone and scan the QR code. Details: [EXPO.md](EXPO.md).

## Web app

```bash
npm install
npm run dev
```

Open [http://localhost:43217](http://localhost:43217). This is the full product, including Road Assist and agency tools.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Citizen | `ama@civicgh.gh` | `civic2026` |
| Accra Metropolitan Assembly | `officer@ama.gov.gh` | `agency2026` |
| Department of Urban Roads | `roads@dur.gov.gh` | `agency2026` |

## What this MVP includes

- Full-screen interactive civic map of Greater Accra
- Issue cards and a complaint history with before / during / after evidence that is appended, never overwritten
- Citizen verification and dispute
- Road Assist on the web app
- Privacy: no public phone/email; map pins use approximated public locations

Data for this MVP lives on the device / in the browser. Do not invent completed-work counts or extra years. If a year has no records, it is 0.
