# IVantasia – Update: Stapel pro Kartentyp

## Was geändert werden muss

Die aktuelle Implementierung zeigt in einer Kategorie alle Vorderseiten aller Karten und zieht ohne Typ-Unterscheidung. Das muss grundlegend umgebaut werden.

---

## Neue Logik: Stapel pro Kartentyp

### State-Änderung

Statt einem Stapel pro Kategorie gibt es neu **einen Stapel pro `type`**.

Der State für `decks` wird umstrukturiert:

```js
decks: {
  // Kategorie spielvorbereitung
  held:        { remaining: [], drawn: [] },
  fluch:       { remaining: [], drawn: [] },

  // Kategorie quest
  alchemist:   { remaining: [] },   // zurücklegen – kein drawn
  drache:      { remaining: [] },
  schreiber:   { remaining: [] },
  lehre:       { remaining: [] },

  // Kategorie spiel
  goblin:      { remaining: [], drawn: [] },
  sozialhilfe: { remaining: [], drawn: [] },
  schande:     { remaining: [], drawn: [] },
  schicksal:   { remaining: [], drawn: [] },

  // Kategorie questschein
  schein_arzt:       { remaining: [], drawn: [] },
  schein_anmeldung:  { remaining: [], drawn: [] },
  schein_dossier:    { remaining: [], drawn: [] },
  schein_gutachten:  { remaining: [], drawn: [] },
  schein_zertifikat: { remaining: [], drawn: [] },
  schein_arbeit:     { remaining: [], drawn: [] },
  schein_urteil:     { remaining: [], drawn: [] },
}
```

**Wichtig für Questscheine:** Die Scheine haben alle `type: "schein"` in der DB, unterscheiden sich aber durch ihre `id` (z.B. `schein_arzt_1`, `schein_anmeldung_1`). Die Deck-Keys für Scheine werden aus dem ID-Präfix abgeleitet: `schein_arzt`, `schein_anmeldung`, `schein_dossier`, `schein_gutachten`, `schein_zertifikat`, `schein_arbeit`, `schein_urteil`. Gruppierung: alle Karten deren `id` mit `schein_arzt_` beginnt → Deck `schein_arzt`, usw.

**Zieh-Verhalten bleibt gleich:**
- `quest`-Typen (alchemist, drache, schreiber, lehre): zurücklegen – kein `drawn`
- Alle anderen: nicht zurücklegen – hat `drawn`

---

## Neue Übersicht: Ein Stapel pro Typ

### Was angezeigt wird

In der Kategorie-Ansicht (CardStack) wird **pro Deck genau ein Kartenbild** angezeigt – der Repräsentant des Stapels.

- **Repräsentant**: immer `front_img` der ersten Karte des Typs (niedrigster `page_index`) – unveränderlich, egal wie viele Karten noch verbleiben
- **Kein Zähler** unter dem Bild
- **Stapel leer**: Kartenbild ausgegraut + Overlay «Leer» (statt «Gezogen»)
- **Klick auf den Stapel** → zieht eine zufällige Karte aus diesem Deck (`DRAW_CARD` mit `deckKey`)

### Sonderfall: Held-Stapel

Für den Typ `held` wird **kein Kartenbild** angezeigt, sondern ein styled Button:

```
┌─────────────────┐
│                 │
│   ⚔ Held ziehen │
│                 │
└─────────────────┘
```

- Gleiche Grösse wie ein Kartenslot (portrait)
- Wenn Deck leer: Button deaktiviert, Text «Alle Helden gezogen»
- Klick → zieht zufälligen Helden (`DRAW_CARD` mit `deckKey: 'held'`)

### Querformat in der Übersicht

Karten mit `orientation: "landscape"` müssen im Grid **quer** dargestellt werden:
- Portrait-Slot: z.B. 160px × 240px
- Landscape-Slot: z.B. 240px × 160px (Breite/Höhe getauscht)
- Das Kartenbild füllt den Slot aus (`object-fit: cover` oder `width: 100%`)

---

## Aktualisierte Aktionen im Reducer

### `DRAW_CARD`
Erhält neu einen `deckKey` Parameter:
```js
{ type: 'DRAW_CARD', payload: { deckKey: 'fluch' } }
```

- Zieht zufällige Karte aus `decks[deckKey].remaining`
- Quest-Typen: Karte bleibt in `remaining`
- Andere: Karte wandert von `remaining` → `drawn`
- Setzt `activeCard` mit der gezogenen Karte

### `RESHUFFLE_DECK`
Erhält neu einen `deckKey` Parameter:
```js
{ type: 'RESHUFFLE_DECK', payload: { deckKey: 'fluch' } }
```
Nur für Nicht-Quest-Decks: verschiebt `drawn` → `remaining`, mischt neu.

### `LOAD_CARDS` / `START_GAME` / `NEW_GAME`
Initialisiert alle Decks korrekt gruppiert nach `type` (bzw. ID-Präfix für Scheine).
Filtert `adult: true` Karten wenn `adultMode: false`.

---

## Reshuffle-Button

Pro Deck-Slot in der Übersicht: kleines Reshuffle-Icon (🔄) oder Text-Button «neu mischen» erscheint **nur wenn das Deck leer ist** und der Typ kein Quest-Typ ist.

Oder alternativ: Reshuffle-Button erscheint immer unter dem Stapel (ausser bei Quest-Typen), ist aber nur aktiv wenn `drawn.length > 0`.

---

## Zusammenfassung der Änderungen

| Datei | Was ändert sich |
|---|---|
| `App.jsx` | `decks` State-Struktur, alle Reducer-Cases |
| `CardStack.jsx` | Grid zeigt Stapel statt Einzelkarten, Held-Sonderfall, Querformat |
| `CategoryPage.jsx` | Zähler-Anzeige anpassen (optional, da kein Zähler mehr pro Stapel) |
| `CardModal.jsx` | Keine Änderung nötig |
