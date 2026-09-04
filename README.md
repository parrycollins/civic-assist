# CivicGH

CivicGH is a civic accountability app for Ghana. It connects three systems on one geographic record:

1. **Civic reporting** — citizens report problems with photos and approximate locations.
2. **Civic accountability** — agencies update status, upload before / during / after evidence, and are scored on resolution and citizen verification.
3. **Road Assist** — the same civic data overlays live routes so travellers can compare fastest, balanced, and best-condition options.

The map is a visual history of community problems and public-service work, not only a pinboard of complaints.

## Phone (Expo Go)

This is the **same CivicGH** as the website, opened in Expo Go. You do not need Android Studio.

**Terminal 1**

```bash
npm install
npm run dev
```

**Terminal 2**

```bash
cd mobile
npm install
npx expo start
```

Install [Expo Go](https://expo.dev/go) and scan the QR code. Phone and computer must be on the same Wi‑Fi. Details: [EXPO.md](EXPO.md).

## Browser

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

- Full-screen interactive civic map of Greater Accra
- Issue cards and a complaint history with before / during / after evidence that is appended, never overwritten
- Citizen verification and dispute
- Road Assist
- Privacy: no public phone/email; map pins use approximated public locations
- **Completed Works** — a public civic achievement archive in the bottom navigation (Home · Map · Road Assist · Report · Completed · Profile)
- **CivicGH Cloud dispatch** — every report is stored in the app cloud. Reports of the same problem near the same location are counted together. After you file, CivicGH tells you if you are the 1st, 2nd, 3rd… person to report it. The responsible agency is notified only when **5** nearby complaints are reached.

Data for this MVP lives in the browser (and a CivicGH Cloud ledger at `/api/cloud/complaints`). Do not invent completed-work counts or extra years. If a year has no records, it is 0.

## Deploy on Vercel

Import the GitHub repo. Leave **Root Directory** empty (the Next.js app at the repo root). Do not set Root Directory to `mobile/` — that Expo folder is the phone wrapper only.
