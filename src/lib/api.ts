import { OpenAI } from 'openai';
import { exampleTemplate } from '../data/exampleTemplate';
import type { Template } from './types';

export async function processTemplate(
  template: Template,
  input: string,
  model: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<Template> {
  const client = new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const prompt = `
Als didaktischer Assistent helfen Sie bei der Vervollständigung oder Anpassung dieses Templates. Bitte stellen Sie sicher, dass ALLE folgenden Elemente vollständig und sinnvoll ausgefüllt werden:

1. Allgemeine Metadaten:
   - Titel
   - Beschreibung
   - Schlüsselwörter
   - Autor
   - Version

2. Patternelemente:
   - Problem mit Beschreibung, Lernzielen und didaktischen Schlüsselwörtern
   - Kontext (Zielgruppe, Fach, Bildungsstufe, Voraussetzungen, Zeitrahmen)
   - Einflussfaktoren als Kräfte zwischen Problem und Lösung
   - Lösung mit Beschreibung und didaktischem Ansatz (als "Adjektiv + Lernen")
   - Konsequenzen (Vor- und Nachteile)
   - Umsetzungshinweise
   - Verwandte Muster
   - Feedback
   - Quellen

3. Sequenzierungsoptionen:
   Für Lernsequenzen:
   - Sequenziell: Feste Reihenfolge
   - Parallel: Gleichzeitige Durchführung
   - Bedingt: Übergang mit Bedingungen
   - Alle abgeschlossen: Warten auf Abschluss aller
   - Eine von: Auswahl einer Option

   Für Phasen:
   - Sequenziell: Feste Reihenfolge

   Für Aktivitäten:
   - Sequenziell: Feste Reihenfolge
   - Parallel: Gleichzeitige Durchführung
   - Bedingt: Übergang mit Bedingungen
   - Branching: Pfadauswahl
   - Looping: Wiederholung
   - Optional: Freiwillige Aktivität
   - Feedback Loops: Rückkehr basierend auf Feedback

   Für Rollen:
   - Parallel: Immer gleichzeitige Durchführung

4. Integration von Lernumgebungen und Akteuren:
   - Jede Rolle braucht actor_id und learning_environment
   - Wählen Sie passende Ressourcen (selected_materials, selected_tools, selected_services)
   - Berücksichtigen Sie Sprachniveau und Bedürfnisse der Akteure

5. Assessment:
   - Formativ (laufend) oder summativ (abschließend)
   - Bewertungsmethoden
   - Erfolgskriterien

WICHTIG:
- Eine Lernsequenz = eine Unterrichtseinheit
- Sinnvolles Assessment-Konzept integrieren
- Passende Lernziele einbauen
- Alle Rollen aktiv gestalten
- Ressourcen effektiv nutzen

Aktuelles Template:
${JSON.stringify(template, null, 2)}

Beispielvorlage als Referenz:
${JSON.stringify(exampleTemplate, null, 2)}

Anweisungen des Nutzers:
${input}

Bitte geben Sie das vervollständigte Template als JSON-Objekt zurück.
`;

  // Create a promise that rejects when the signal is aborted
  const abortPromise = new Promise((_, reject) => {
    signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  });

  try {
    // Race between the API call and abort signal
    const result = await Promise.race([
      client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'Sie sind ein erfahrener didaktischer Assistent, der vielfältige und flexible Lernszenarien mit allen erforderlichen Details erstellt.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      }),
      abortPromise
    ]);

    // If we got here, the API call completed successfully
    if ('choices' in result && result.choices[0].message.content) {
      return JSON.parse(result.choices[0].message.content);
    }

    throw new Error('Keine Antwort vom KI-Modell');
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw error;
  }
}