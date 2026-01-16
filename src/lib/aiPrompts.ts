export const FLOW_GENERATION_PROMPT = `
Als ein KI-Assistent für didaktisches Design, MODIFIZIERE SORGFÄLTIG die bestehende Lernsequenz basierend auf den spezifischen Anforderungen des Nutzers.

KRITISCHE ANFORDERUNGEN:

1. BESTEHENDE INHALTE BEWAHREN:
   - Aktuelles Thema und Kernziele unverändert lassen, außer explizit angefordert
   - Bestehende Akteure und Lernumgebungen beibehalten
   - Aktuellen didaktischen Ansatz bewahren, wenn nicht anders gewünscht
   - KEINE Änderung der Quellentypen bestehender Ressourcen
   - Für neue Ressourcen IMMER Quellentyp "manual" setzen
   - NUR explizit genannte Elemente modifizieren

2. Integration der Lernumgebung:
   - Mindestens eine detaillierte Lernumgebung pro Sequenz erstellen
   - Jede Umgebung MUSS einen klaren Zweck und Aufbau haben
   - MUSS physische und digitale Komponenten enthalten
   - MUSS Raumaufteilung, technische Ausstattung oder Plattform-Features spezifizieren

3. Lernressourcen:
   - Jede Aktivität MUSS mit spezifischen Lernmaterialien verknüpft sein
   - Materialien MÜSSEN vielfältig sein (Video, Arbeitsblätter, Quizz, Dokumente, interaktiv etc.)
   - MUSS Materialien für Lehrende und Lernende enthalten
   - MUSS genaue Verwendung in Aktivitäten spezifizieren

4. Werkzeuge:
   - Jede Aktivität MUSS erforderliche Werkzeuge angeben
   - MUSS digitale und physische Werkzeuge einbeziehen
   - MUSS erklären, wie jedes Werkzeug den Lernprozess unterstützt
   - MUSS Zugänglichkeit und technische Anforderungen berücksichtigen

5. Unterstützungsdienste:
   - MUSS benötigte Unterstützungsdienste für jede Phase angeben
   - Technische, pädagogische und inhaltliche Unterstützung einbeziehen
   - MUSS Details zu Zugang und Nutzung der Dienste angeben
   - Unterstützung für Lehrende und Lernende berücksichtigen

6. Rollen-Ressourcen-Zuordnung:
   - MUSS jede Rolle explizit verknüpfen mit:
     * Erforderlichen Materialien
     * Notwendigen Werkzeugen
     * Unterstützungsdiensten
   - MUSS Verwendung jeder Ressource spezifizieren
   - MUSS Backup/Alternative Optionen einplanen
   - Zuordnung der Ressourcen nur zu der Rolle, die diese in der Aktivität benötigt oder damit vorwiegend interagiert)

7. Aktivitätsgestaltung:
   - Jede Aktivität MUSS spezifizieren:
     * Exakte verwendete Materialien
     * Benötigte Werkzeuge und deren Zweck
     * Verfügbare Unterstützungsdienste
     * Aufbau der Lernumgebung
   - MUSS Vorbereitungsanforderungen enthalten
   - MUSS Übergänge zwischen Aktivitäten spezifizieren

8. Ressourcenzugang:
   - MUSS Zugriffsmethode für jede Ressource angeben
   - Klare URLs oder physische Standorte angeben
   - MUSS Offline-Alternativen berücksichtigen
   - MUSS Zugänglichkeitsanforderungen adressieren

9. Qualitätssicherung:
   - MUSS alle Ressourcen auf Eignung prüfen für:
     * Bildungsniveau
     * Fachgebiet
     * Lernziele
     * Zielgruppe
   - MUSS Alternativen für technische Probleme vorsehen

Beachten Sie:
- NUR explizit angeforderte Änderungen vornehmen
- ALLE bestehenden nicht erwähnten Inhalte bewahren
- AKTUELLES Thema und Ziele beibehalten
- Für neue Ressourcen IMMER Quelle "manual" setzen
- NIEMALS bestehende Ressourcen-Quellentypen ändern
- Jede Aktivität MUSS vollständige Ressourcenspezifikationen haben
- Alle Ressourcen MÜSSEN klar mit Rollen verknüpft sein
- Jede Umgebung MUSS vollständig detailliert sein
- Spezifische Zugangsinformationen für alle Ressourcen angeben
- Inklusives Design durchgängig berücksichtigen

Geben Sie Ihre Antwort als vollständiges JSON-Objekt mit folgender Struktur zurück:
{
  "metadata": { ... },
  "problem": { ... },
  "context": { ... },
  "influence_factors": [ ... ],
  "solution": {
    "solution_description": "...",
    "didactic_approach": "...",
    "didactic_template": {
      "learning_sequences": [ ... ]
    }
  },
  "consequences": { ... },
  "implementation_notes": [ ... ],
  "related_patterns": [ ... ],
  "feedback": { ... },
  "sources": [ ... ],
  "actors": [ ... ],
  "environments": [ ... ]
}`;

export const ENVIRONMENT_ENHANCEMENT_PROMPTS = {
  physical: `
CRITICAL: You MUST enhance the physical learning environment and return a JSON object with:
- Room layout and furniture
- Display and presentation equipment
- Storage solutions
- Lighting and acoustics
- Movement and activity zones
- Quiet and focus areas
- Collaboration spaces
- Safety considerations
- Accessibility features
- Required materials and tools
- Support services
- Integration with activities
- Role-specific areas
- Resource organization
- Emergency procedures

Return your response as a JSON object with this structure:
{
  "name": "...",
  "description": "...",
  "materials": [ ... ],
  "tools": [ ... ],
  "services": [ ... ]
}`,

  virtual: `
CRITICAL: You MUST enhance the virtual learning environment and return a JSON object with:
- Platform features and requirements
- Communication tools
- File sharing and storage
- Collaboration spaces
- Progress tracking
- Technical support options
- Backup and redundancy
- Security measures
- Accessibility features
- Digital materials and tools
- Online support services
- Activity integration
- Role permissions
- Resource management
- Contingency plans

Return your response as a JSON object with this structure:
{
  "name": "...",
  "description": "...",
  "materials": [ ... ],
  "tools": [ ... ],
  "services": [ ... ]
}`,

  hybrid: `
CRITICAL: You MUST enhance the hybrid learning environment and return a JSON object with:
- Synchronous and asynchronous elements
- Physical-digital integration
- Transition strategies
- Equipment requirements
- Participation options
- Communication channels
- Resource accessibility
- Backup plans
- Support services for both modes
- Materials for both settings
- Tools for seamless integration
- Activity coordination
- Role flexibility
- Resource synchronization
- Emergency procedures

Return your response as a JSON object with this structure:
{
  "name": "...",
  "description": "...",
  "materials": [
    {
      "name": "...",
      "type": "...",
      "access_link": "..."
    }
  ],
  "tools": [
    {
      "name": "...",
      "type": "...",
      "access_link": "..."
    }
  ],
  "services": [
    {
      "name": "...",
      "type": "...",
      "access_link": "..."
    }
  ]
}`
};

export const SEQUENCE_VALIDATION_PROMPT = `
CRITICAL: Validate and ensure the learning sequence includes:

1. Environment Completeness:
   - Every activity has a specified environment
   - Environments have all necessary resources
   - Clear setup instructions exist

2. Resource Coverage:
   - All required materials are listed
   - Necessary tools are specified
   - Support services are defined
   - Access information is complete

3. Role-Resource Mapping:
   - Each role has assigned resources
   - Resource usage is clearly defined
   - Alternatives are specified

4. Activity Integration:
   - Resources match activity needs
   - Transitions are well-defined
   - Support is readily available

5. Accessibility:
   - Resources are accessible
   - Alternatives exist
   - Support is available

Return validation results as a JSON object with:
{
  "isValid": boolean,
  "issues": string[],
  "fixes": string[]
}`;