# Trikaal

Personal Vedic astrology software for Android (and the browser). Everything is calculated on the phone, offline.

**Install:** open the latest release on your phone and download `trikaal.apk`:
https://github.com/mehulozaconnect/Jyotish-app/releases/latest

## What it does

- **Kundli for anyone:** any date, time and place (offline city list plus online search), historical time zones handled.
- **Charts:** D1, Bhava Chalit, Moon and Sun charts and all 16 vargas (D2 to D60) with degrees and minutes. North Indian by default, South Indian toggle.
- **Dasha:** Vimshottari from Mahadasha to Sookshma and Prana, and Yogini.
- **Ayanamsa:** N.C. Lahiri, KP, B.V. Raman, True Chitrapaksha. Mean or true nodes.
- **KP:** cusps with sign, star, sub and sub-sub lords, 4-step significators, house significators A to D, ruling planets, judgement with timing, and KP Prashna (1 to 249).
- **Reading:** personality, health, career, money, marriage, children, current period and the next 3 years, each point with the chart facts behind it, judged through the functional benefics and malefics of the lagna.
- **Transit, month by month:** every planet's position, house from lagna and Moon, verdict (gochar, own Ashtakavarga bindus, vedha), the ruling dasha planet, Sade Sati, Chandrashtama days.
- **Health:** house by house, the next 6 months, and dasha links.
- **Event analysis:** why something happened on a date, the planet that triggered it, and when support returns.
- **Ashtakavarga, Varshphal (Tajik), yogas and doshas, birth-time sensitivity.**
- **Remedies:** gemstones, Rudraksha, crystals, mantras, daan, fasts and Lal Kitab, chosen by the lagna.
- **Today:** My day (synced with your transits), Panchang, Choghadiya, Hora, Rahu Kaal, Bhadra, and a Muhurat finder.
- **Ask:** an offline reasoning engine for common questions; add your own Anthropic API key in More for free-form questions about the computed chart.

## Accuracy

Planets come from Astronomy Engine with the Swiss Ephemeris sidereal convention (mean ayanamsa, nutation removed); positions agree with Swiss Ephemeris to arc-seconds. Readings follow classical rules (BPHS, Phaladeepika, KP Readers, Tajik Neelakanthi) and always show their logic.

## Build

```
node test/smoke.js     # engine checks
node build.js          # writes dist/index.html (one self-contained file)
```

GitHub Actions (`.github/workflows/android.yml`) builds the web app, wraps it in the Android WebView shell in `android/`, signs it and publishes `trikaal.apk` as a release on every push to `main`.

`index.html` at the root is the same app for the browser. The earlier Jyotish Compass page is in `legacy/`.

Data stays on the device. Use More › Backup to save a file before changing phones.
