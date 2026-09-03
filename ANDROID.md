# CivicGH for Android Studio

Open the **`android/`** folder in Android Studio. That folder is a standalone Gradle project (Kotlin + Jetpack Compose). The Next.js app in the repo root is the full web reference; this native slice is what you continue in Android Studio.

## Open the project

1. Install [Android Studio](https://developer.android.com/studio) (Ladybug / 2024.2 or newer is fine).
2. **File → Open** and select the `android` directory — not the repo root.
3. Let Gradle sync. Install **SDK 35** and a device or emulator with API 26+.
4. Run the **app** configuration.

Android Studio writes `local.properties` with your SDK path. Do not commit that file.

```
android/          ← open this folder
  app/
  gradle/wrapper/
  build.gradle.kts
  settings.gradle.kts
```

## What ships in this native slice

Citizen flows only, using the same Greater Accra seed and demo logins as the web app:

| Screen | What it does |
| --- | --- |
| Home | Greeting, live counts from the seed, shortcuts, recently completed |
| Map | OpenStreetMap via osmdroid (no Google Maps key). Pins use approximated locations. Toggle **Completed** |
| Report | Category tiles, then title + description |
| Completed | Public archive of resolved / verified work. Empty years stay at 0 |
| Profile | Demo sign-in, recognition toggle, dark mode, reports you filed on this device |
| Detail | Status journey, timeline, citizen verify / dispute when a report is resolved |

Package name: `gh.civic.civicgh`. Minimum SDK 26.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Citizen | `ama@civicgh.gh` | `civic2026` |
| Accra Metropolitan Assembly | `officer@ama.gov.gh` | `agency2026` |
| Department of Urban Roads | `roads@dur.gov.gh` | `agency2026` |

Agency dashboards, Road Assist routing, and photo/video evidence upload stay on the web app for now.

## Stack

- Kotlin 2.0, Jetpack Compose, Material 3
- Navigation Compose
- osmdroid 6.1.20 for the map
- In-memory repository (same seed as the web featured issues)

## Command line (optional)

From `android/`:

```bash
./gradlew assembleDebug
```

You need a JDK 17+ and the Android SDK. Android Studio is the intended path.

## Privacy and data rules

- No public phone or email on reports.
- Map pins use the same approximated coordinates as the web seed.
- Do not invent completed-work counts, extra years, photos, or names. If a year has no records, it is 0.
