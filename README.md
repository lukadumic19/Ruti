# Ruti

Rutineplanlægning for børn – en visuel dagsplan-app, hvor pædagoger/forældre opretter børn med hver deres rutine, og barnet selv kan følge og afkrydse dagens aktiviteter. Al data gemmes lokalt på enheden; appen kræver ingen internetforbindelse og indsamler ingen data.

## Projektstruktur

| Sti | Beskrivelse |
|---|---|
| `src/app.jsx` | **Appens kildekode** (React). Det er her, du fremover retter i appen. |
| `www/` | Det byggede web-output, som iOS-appen viser (`bundle.js` genereres af build). |
| `ios/` | Det native Xcode-projekt (genereret af Capacitor). |
| `assets/` | Kildefiler til app-ikon (`icon.png`, 1024×1024) og splash screen. |
| `capacitor.config.json` | App-navn (`Ruti`) og bundle-id (`com.lukadumic.ruti`). |
| `index.html` | Den gamle selvstændige webversion (bruges af GitHub Pages). Rettes appen, så ret i `src/app.jsx` – denne fil opdateres ikke automatisk. |

## Udvikling

```bash
npm install        # første gang
npm run dev        # udviklingsserver med automatisk genbyg (åbn http://localhost:8000)
npm run build      # byg www/bundle.js
```

## Udgivelse på App Store – trin for trin

Selve udgivelsen **kræver en Mac med Xcode** samt et [Apple Developer Program](https://developer.apple.com/programs/)-medlemskab (99 USD/år).

### 1. Forbered projektet på din Mac

```bash
git clone https://github.com/lukadumic19/Ruti.git
cd Ruti
npm install
npm run build
npx cap sync ios
```

Installér CocoaPods, hvis du ikke har det: `brew install cocoapods` (kør derefter `npx cap sync ios` igen).

### 2. Åbn og konfigurér Xcode-projektet

```bash
npx cap open ios
```

I Xcode:

1. Vælg projektet **App** i venstre side → target **App** → fanen **Signing & Capabilities**.
2. Sæt **Team** til din Apple Developer-konto (log ind under Xcode → Settings → Accounts, hvis den mangler).
3. Kontrollér **Bundle Identifier**: `com.lukadumic.ruti` (skal være unik – ret evt. både her og i `capacitor.config.json`).
4. Test appen: vælg en simulator eller din egen iPhone øverst og tryk **▶ Run**.

### 3. Opret appen i App Store Connect

1. Gå til [App Store Connect](https://appstoreconnect.apple.com) → **Apps** → **+** → **New App**.
2. Platform: iOS. Navn: fx **Ruti**. Sprog: Dansk. Bundle ID: vælg `com.lukadumic.ruti`. SKU: fx `ruti-001`.

### 4. Upload en build

1. I Xcode: vælg **Any iOS Device (arm64)** som destination.
2. Menu **Product → Archive**.
3. Når arkivet er klar, åbnes **Organizer** → **Distribute App** → **App Store Connect** → **Upload**.
4. Vent 10–30 min., til builden dukker op under **TestFlight** i App Store Connect.

### 5. Udfyld app-oplysninger og send til review

I App Store Connect under din app:

- **Screenshots**: mindst ét sæt for 6,7" og 6,5" iPhone (tag dem i simulatoren med ⌘S).
- **Beskrivelse, nøgleord, support-URL**.
- **Privatlivspolitik-URL** (obligatorisk): Da appen intet indsamler, rækker en simpel side, fx på GitHub Pages, med teksten *"Ruti indsamler, gemmer eller deler ingen personoplysninger. Al data gemmes udelukkende lokalt på enheden."*
- **App Privacy**: vælg **Data Not Collected**.
- **Aldersgrænse**: 4+.
- **Priser**: Gratis (eller vælg pris).
- Vælg builden fra trin 4, og tryk **Add for Review** → **Submit**.

Apple svarer typisk inden for 1–3 dage. **Tip til review**: skriv i "Notes" til reviewer, at pædagog-panelet åbnes med standard-PIN **1234**, så de kan teste hele appen.

### Godt at vide

- **Afvisningsrisiko (guideline 4.2)**: Apple afviser apps, der blot er et website i en ramme. Ruti kører 100 % offline med lokal datalagring og app-lignende interaktion, hvilket normalt er nok – men jo mere "native" den føles (ikon, splash, ingen døde links), jo bedre.
- **Nyt ikon?** Udskift `assets/icon.png` (1024×1024) og `assets/splash.png` (2732×2732) og kør `npx @capacitor/assets generate --ios`.
- **Opdateringer**: Ret `src/app.jsx` → `npm run build` → `npx cap sync ios` → hæv versionsnummer i Xcode (App target → General) → Archive og upload igen.
