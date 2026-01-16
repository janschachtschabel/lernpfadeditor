# Lernpfadeditor

Ein KI-gestützter Editor zur Erstellung differenzierter Lernpfade mit automatischer Binnendifferenzierung und WLO-Integration.

## ✨ Features

### KI-gestützte Lernpfaderstellung
- **Automatische Template-Generierung** aus natürlichsprachlichen Beschreibungen
- **Beispiel-Button** für schnellen Einstieg mit Differenzierungsbeispiel
- **Intelligente Binnendifferenzierung** für heterogene Lerngruppen
- **Automatische Rollenzuweisung** für Aktivitäten
- **Spracherkennung** via OpenAI Whisper für Diktierfunktion
- **Parallelisierte KI-Aufrufe** (bis zu 20 gleichzeitig) für schnelle Generierung

### Binnendifferenzierung
- **Automatische Erkennung** von Teilgruppen mit besonderen Bedürfnissen aus der Beschreibung
- **Maßnahmenbasierte Differenzierung** (z.B. "Visuelle Unterstützung", "Vereinfachte Sprache")
- **Leistungsdifferenzierung** für Hauptgruppen (Erweiterung & Basisunterstützung)
- **Spezifische Fördermaßnahmen** für Gruppen mit besonderen Bedarfen
- **Kompakte Tooltip-Visualisierung** der Differenzierungshinweise in der Vorschau

### WLO-Integration (WirLernenOnline.de)
- **Automatische Inhaltssuche** passend zu Aktivitäten und Rollen
- **KI-basiertes Ranking** der besten Ressourcen (Top 5 aus ~30)
- **Filterung** nach Fach und Bildungsstufe
- **Parallelisierte Suche** für schnelle Ergebnisse
- **Warenkorb-System** zum Sammeln und Verwalten von Ressourcen

### Visualisierung & Export
- **Tabellarische Übersicht** mit Rollen, Materialien und Differenzierungsoptionen
- **Interaktiver Ablaufgraph** für Lernsequenzen
- **PDF-Export** für Unterrichtsvorbereitung
- **JSON Import/Export** für Templates

### Template-Management
- **Community-Templates** zum Laden und Anpassen
- **Lokale Speicherung** im Browser
- **Beispiel-Templates** für verschiedene Fächer und Klassenstufen

## 🚀 Schnellstart

### Voraussetzungen
- Node.js (Version 18+)
- OpenAI API-Schlüssel

### Installation
```bash
npm install
```

### Entwicklung
```bash
npm run dev
```

Die Anwendung läuft unter `http://localhost:5173`

### Umgebungsvariablen (optional)
```env
VITE_OPENAI_API_KEY=sk-...
```
Alternativ kann der API-Key in den Einstellungen eingegeben werden.

## Projektstruktur

```
src/
  ├── components/         # React-Komponenten
  │   ├── course/        # Komponenten für Unterrichtsablauf
  │   ├── environments/  # Komponenten für Lernumgebungen
  │   ├── preview/       # Komponenten für Vorschau
  │   └── wlo/          # Komponenten für WLO-Integration
  ├── lib/              # Hilfsfunktionen und Utilities
  ├── pages/            # Hauptseiten der Anwendung
  └── store/            # Zustand-Management mit Zustand

public/                 # Statische Assets
  └── community-templates/ # Vordefinierte Templates
```

## 📋 Workflow

### Schneller Einstieg (empfohlen)
1. **KI Assistent** → Lernpfad beschreiben (inkl. Teilgruppen mit besonderen Bedürfnissen)
2. **Vorschau** → Ergebnis prüfen und exportieren

### Manueller Workflow
1. **Allgemeines** - Metadaten und Kontext festlegen
2. **Didaktische Grundlagen** - Lernziele und Probleme definieren
3. **Akteure** - Lehrende und Lerngruppen anlegen
4. **Lernumgebungen** - Materialien, Werkzeuge und Dienste zuordnen
5. **Unterrichtsablauf** - Sequenzen, Phasen und Aktivitäten gestalten
6. **Vorschau** - Visualisieren und exportieren

## 🛠️ Technologie

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS
- **State**: Zustand
- **KI**: OpenAI API (GPT-4o, Whisper)
- **Bildungsressourcen**: WirLernenOnline.de API

## 📄 Lizenz

Apache 2.0