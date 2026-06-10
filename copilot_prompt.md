# Copilot Prompt – IVantasia Kartensimulator

## Auftrag
Erstelle eine React Web-App als Kartensimulator für das Brettspiel **IVantasia**.
Die App wird statisch auf GitHub Pages gehostet (kein Backend, kein Server).

---

## Projektstruktur

```
karten-von-IVantasia/
├── public/
│   └── karten/
│       ├── cards_db.json
│       ├── vorderseiten/   ← PNG-Bilder Vorderseiten
│       └── rueckseiten/    ← PNG-Bilder Rückseiten
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── components/
│       ├── HomePage.jsx
│       ├── CategoryPage.jsx
│       ├── CardStack.jsx
│       └── CardModal.jsx
├── package.json
└── vite.config.js
```

Verwende **React + Vite**. Keine weiteren Abhängigkeiten ausser `react`, `react-dom`.
CSS wird in `index.css` geschrieben – kein Tailwind, kein CSS-Framework.

---

## Datenbasis

Die App lädt beim Start `public/karten/cards_db.json`. Beispielstruktur einer Karte:

```json
{
  "id": "goblin_1",
  "type": "goblin",
  "name": "Terminchaos",
  "display": "Goblin – Terminchaos",
  "orientation": "portrait",
  "usage": "spiel",
  "adult": false,
  "page_index": 26,
  "front_img": "vorderseiten/027_goblin_1_front.png",
  "back_img": "rueckseiten/027_goblin_1_back.png"
}
```

**Felder:**
- `orientation`: `"portrait"` oder `"landscape"` – bestimmt die Darstellung im Modal
- `usage`: `"spielvorbereitung"` | `"quest"` | `"spiel"` | `"questschein"` – für Navigation
- `adult`: `true` = Erwachsenenkarte (wird bei aktivem Jugendschutz ausgefiltert)
- `front_img` / `back_img`: Pfad relativ zu `public/karten/`

---

## Zieh-Verhalten pro Kategorie

Dies ist die zentrale Spiellogik – jede Kategorie verhält sich anders:

| Kategorie | Zieh-Verhalten |
|---|---|
| `spielvorbereitung` | Zufällig ziehen, **nicht zurücklegen** (ohne Ersatz) |
| `spiel` | Zufällig ziehen, **nicht zurücklegen** (ohne Ersatz) |
| `questschein` | Zufällig ziehen, **nicht zurücklegen** (ohne Ersatz) |
| `quest` | Zufällig ziehen, **zurücklegen** (mit Ersatz – Stapel leert sich nie) |

**Konsequenzen für den State:**
- Kategorien mit «nicht zurücklegen»: haben `remaining` und `drawn`. Gezogene Karten wandern von `remaining` → `drawn`. Stapel kann leer werden. Reshuffle möglich.
- Kategorie `quest`: hat nur `remaining` (alle Karten immer verfügbar). Gezogene Karte bleibt im Stapel. Kein `drawn`, kein Reshuffle-Button. Der «Karte ziehen»-Button ist nie deaktiviert.

---

## Spiellogik & State

Verwende `useReducer` für den globalen Spielstate. Der State enthält:

```js
{
  gameStarted: boolean,          // false = Startscreen, true = Spiel läuft
  adultMode: boolean,            // false = Jugendschutz aktiv (Erwachsenenkarten ausgeblendet)
  cards: [],                     // alle Karten aus cards_db.json
  decks: {
    spielvorbereitung: { remaining: [], drawn: [] },  // ohne Ersatz
    quest:             { remaining: [] },              // mit Ersatz – kein drawn
    spiel:             { remaining: [], drawn: [] },   // ohne Ersatz
    questschein:       { remaining: [], drawn: [] },   // ohne Ersatz
  },
  activeCard: null,              // aktuell angezeigte Karte im Modal
  activeCategory: null,          // aktuell gewählte Kategorie
}
```

**Aktionen für den Reducer:**

- `LOAD_CARDS` – lädt cards_db.json, initialisiert alle Decks gefiltert nach `adultMode`
- `START_GAME` – setzt `gameStarted = true`, mischt alle Decks
- `NEW_GAME` – setzt alles zurück, mischt neu
- `TOGGLE_ADULT_MODE` – schaltet `adultMode` um, filtert und initialisiert alle Decks neu (drawn wird zurückgesetzt)
- `SET_CATEGORY` – setzt `activeCategory`
- `DRAW_CARD` – zieht zufällige Karte aus `activeCategory`:
    - Kategorien ohne Ersatz: zufällige Karte aus `remaining` → `activeCard`, aus `remaining` entfernen, zu `drawn` hinzufügen
    - `quest` (mit Ersatz): zufällige Karte aus `remaining` → `activeCard`, Karte bleibt in `remaining`
- `FLIP_CARD` – setzt `activeCard.flipped = true`
- `CLOSE_MODAL` – setzt `activeCard = null`
- `RESHUFFLE_DECK` – nur für Kategorien ohne Ersatz: verschiebt alle `drawn` zurück zu `remaining`, mischt neu

---

## Screens & Navigation

### Screen 1 – Startscreen (`gameStarted === false`)
- Grosses Logo / Titel «IVantasia Kartensimulator»
- Toggle «Jugendschutz» (standardmässig AN = `adultMode: false`)
    - Label wenn AN: «Jugendschutz aktiv – Erwachsenenkarten ausgeblendet»
    - Label wenn AUS: «Alle Karten aktiv»
- Button «Spiel starten» → dispatcht `START_GAME`

### Screen 2 – Kategorieauswahl (`gameStarted === true`, `activeCategory === null`)
Vier grosse Buttons in einem 2×2 Grid:

| Button | usage-Filter | Anzeigename |
|--------|-------------|-------------|
| Spielvorbereitung | `spielvorbereitung` | «Spielvorbereitung» |
| Spiel | `spiel` | «Spiel» |
| Quest | `quest` | «Quest» |
| Questscheine | `questschein` | «Questscheine» |

- Kategorien **ohne Ersatz**: Button zeigt «X verfügbar / Y gezogen»
- Kategorie **Quest**: Button zeigt «X Karten» (kein Zähler für gezogen, da zurückgelegt)
- Button «Neues Spiel» oben rechts → dispatcht `NEW_GAME`

### Screen 3 – Kartenstapel (`activeCategory !== null`)
- Zurück-Button → `SET_CATEGORY(null)`
- Titel der Kategorie
- Kartenübersicht als Grid – alle Vorderseiten der Kategorie:
    - **Quest**: alle Karten normal angezeigt (keine Graudarstellung, da immer verfügbar)
    - **Alle anderen**: verfügbare Karten normal, gezogene Karten ausgegraut mit Badge «Gezogen»
- Grosser Button «Karte ziehen» → dispatcht `DRAW_CARD`
    - Nur bei Kategorien ohne Ersatz: deaktiviert wenn `remaining` leer
    - Bei Quest: nie deaktiviert
- Button «Stapel neu mischen» → dispatcht `RESHUFFLE_DECK`
    - **Nur sichtbar** bei Kategorien ohne Ersatz (`spielvorbereitung`, `spiel`, `questschein`)
    - Bei Quest: kein Reshuffle-Button
- Anzeige: «X verbleibend / Y gezogen» – nur bei Kategorien ohne Ersatz
    - Bei Quest: «X Karten im Stapel»

### Modal – Karte aufdecken (`activeCard !== null`)
Erscheint als Overlay über dem aktuellen Screen.

**Phase 1 – Vorderseite:**
- Zeigt `front_img` der gezogenen Karte
- Button «Aufdecken» → dispatcht `FLIP_CARD`
- Button «Schliessen» (×) → dispatcht `CLOSE_MODAL`

**Phase 2 – Rückseite (nach `FLIP_CARD`):**
- Zeigt `back_img` der gezogenen Karte
- Flip-Animation: CSS 3D-Kartendreh (`rotateY 0° → 180°`)
- Button «Schliessen» → dispatcht `CLOSE_MODAL`

**Kartenformat im Modal:**
- `orientation === "portrait"`: Karte hochkant, max. 400px breit
- `orientation === "landscape"`: Karte quer, max. 600px breit

---

## Bildpfade

Alle Bilder liegen unter `public/karten/`. Im Code:
```js
const imgSrc = `/karten/${card.front_img}`;
```

Für GitHub Pages muss in `vite.config.js` der `base`-Pfad gesetzt werden:
```js
export default defineConfig({
  base: '/karten-von-IVantasia/',  // GitHub Repo-Name
})
```

---

## CSS & Design

Dunkles Fantasy-Theme passend zum Spielnamen «IVantasia»:

```css
/* Farbpalette */
--color-bg:        #1a1a2e;   /* Dunkles Nachtblau */
--color-surface:   #16213e;   /* Karten/Panel Hintergrund */
--color-accent:    #e94560;   /* Rot-Akzent für Buttons */
--color-accent2:   #0f3460;   /* Dunkelblau Sekundär */
--color-text:      #eaeaea;   /* Haupttext */
--color-muted:     #888;      /* Gedimmter Text */
--color-success:   #4caf50;   /* Gezogen-Overlay */
```

- Schriftart: `'Cinzel'` (Google Fonts) für Titel, `'Lato'` für Fliesstext
- Buttons: abgerundete Ecken, Hover-Effekt mit leichtem Glow in `--color-accent`
- Kartenübersicht: CSS Grid, responsive (2 Spalten mobile, 4 Spalten desktop)
- Gezogene Karten im Grid: 50% Opacity + grüner «Gezogen»-Badge oben rechts
- Modal: dunkles Overlay (`rgba(0,0,0,0.85)`), zentrierte Karte, sanfte Einblend-Animation
- Flip-Animation: CSS `transform: rotateY()` mit `perspective: 1000px`

---

## Wichtige Implementierungshinweise

1. **Mischen**: Fisher-Yates Shuffle für alle Decks beim Start und beim Reshuffle
2. **adultMode**: Karten mit `adult: true` werden aus allen Decks gefiltert. Bei Toggle werden alle Decks neu initialisiert – drawn wird zurückgesetzt.
3. **Quest-Deck nie leer**: Da Quest-Karten zurückgelegt werden, ist `remaining` immer gleich der gefilterten Gesamtliste. Beim Ziehen wird nur `activeCard` gesetzt, nichts aus `remaining` entfernt.
4. **Kein Backend**: Alles läuft im Browser-State. Bei Seitenreload startet die App neu – das ist gewollt.
5. **cards_db.json laden**: Mit `useEffect` beim App-Start via `fetch('/karten/cards_db.json')`.
6. **Fehlerbehandlung**: Falls JSON nicht geladen werden kann, Fehlermeldung anzeigen mit Hinweis dass `public/karten/cards_db.json` fehlt.
7. **GitHub Pages Deploy**: `package.json` soll ein `deploy`-Script enthalten:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "deploy": "vite build && gh-pages -d dist"
   }
   ```
   Mit Abhängigkeit `gh-pages` als devDependency.

---

## Liefere folgende Dateien

- `src/App.jsx` – Haupt-App mit useReducer, fetch, Screen-Routing
- `src/components/HomePage.jsx` – Startscreen
- `src/components/CategoryPage.jsx` – Kategorieauswahl (2×2 Grid)
- `src/components/CardStack.jsx` – Kartenstapel mit Grid und Ziehen-Button
- `src/components/CardModal.jsx` – Modal mit Flip-Animation
- `src/index.css` – komplettes CSS
- `vite.config.js` – mit base-Pfad
- `package.json` – mit allen Dependencies und deploy-Script
- `README.md` – Setup-Anleitung (npm install, npm run dev, npm run deploy)
