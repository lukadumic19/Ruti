# Opgaver

Personlig arbejds-to-do-app til Luka — pædagogisk mellemleder på Havana.

Én HTML-fil, React via CDN, ingen build-step, ingen server. Al data ligger i
`localStorage` på telefonen. PWA, så den kan lægges på hjemmeskærmen på iPhone.

## Sådan bruges den

- **Kategorier** er den faste ramme. En opgave hører til én kategori og skifter
  aldrig kategori — kun status: *Ikke færdig*, *Idé* eller *Færdig*.
- **Gør til opgave** flytter en idé til Ikke færdig og stempler beslutningen
  med dato og en valgfri linje om, hvad der blev besluttet.
- **Beslutninger** er en kronologisk log over alt, der er blevet besluttet —
  uafhængigt af om opgaven bagefter er løst.
- **Overblik** viser alt i gang på tværs af kategorier i én scroll.
- **Backup**: Indstillinger → Eksportér data (JSON-fil) / Importér data.

## Installation på iPhone

1. Læg filerne på et websted med HTTPS (fx GitHub Pages: Settings → Pages →
   Deploy from a branch).
2. Åbn adressen i Safari.
3. Tryk på Del-knappen → **Føj til hjemmeskærm**.

## Filer

| Fil | Indhold |
|---|---|
| `index.html` | Hele appen — markup, styling og al logik |
| `manifest.webmanifest` | PWA-manifest |
| `sw.js` | Service worker (offline-cache) |
| `icon-180.png` / `icon-512.png` | App-ikoner |

## Uden for version 1

Deadlines, påmindelser, prioritering, søgning, gentagne opgaver, deling,
statistik. Tilføjes tidligst, når appen har været i brug en uge.
