# IVantasia Kartensimulator

React-Web-App als digitaler Kartensimulator für das Brettspiel **IVantasia**.  
Statisch gehostet auf GitHub Pages – kein Backend, kein Server.

## Voraussetzungen

- Node.js ≥ 18
- npm ≥ 9

## Setup

```bash
npm install
```

## Entwicklung

```bash
npm run dev
```

Die App läuft dann unter `http://localhost:5173/karten-von-IVantasia/`.

## Build

```bash
npm run build
```

Output liegt in `dist/`.

## Deploy auf GitHub Pages

```bash
npm run deploy
```

Das Script baut die App und pusht `dist/` auf den Branch `gh-pages` des Repos.  
Voraussetzung: Das GitHub-Repo ist unter `github.com/<user>/karten-von-IVantasia` erreichbar  
und GitHub Pages ist auf den Branch `gh-pages` konfiguriert.

## Kartendaten

Die Kartendatenbank liegt unter `public/karten/cards_db.json`.  
Bilder liegen unter `public/karten/vorderseiten/` und `public/karten/rueckseiten/`.

Diese Dateien werden **nicht** mit Vite gebundelt, sondern direkt als statische Assets ausgeliefert.
