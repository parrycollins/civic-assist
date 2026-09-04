# CivicGH Expo app

Expo Go opens the **same CivicGH** you see in the browser (civic map, Road Assist, report, completed work). It is not a second, simpler app.

## Run the exact app on your phone

You need **two terminals**. CivicGH must be running before you scan the QR.

**Terminal 1 — CivicGH**

```bash
cd civic-assist
npm install
npm run dev
```

Leave this running. It serves the app at port **43217**.

**Terminal 2 — Expo Go**

```bash
cd civic-assist/mobile
npm install
npx expo start
```

Install [Expo Go](https://expo.dev/go), then scan the QR code. Phone and computer must be on the **same Wi‑Fi**. Do not use `--tunnel` for this — Expo Go loads CivicGH from your computer’s LAN address.

## Demo login

| Role | Email | Password |
| --- | --- | --- |
| Citizen | `ama@civicgh.gh` | `civic2026` |
| Accra Metropolitan Assembly | `officer@ama.gov.gh` | `agency2026` |
| Department of Urban Roads | `roads@dur.gov.gh` | `agency2026` |

If Expo Go shows a green splash then an error, Terminal 1 is not running or the phone is on a different network.
