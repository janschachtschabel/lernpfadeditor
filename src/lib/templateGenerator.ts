import { validateTemplate } from './templateValidator';

// Helper function for API calls
async function callGPT(apiKey: string, model: string, systemPrompt: string, userPrompt: string, maxTokens: number = 8000): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_output_tokens: maxTokens,
      reasoning: { effort: "medium" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API Fehler: ${response.status}`);
  }

  const data = await response.json();
  let outputText = data.output_text;
  
  if (!outputText && data.output) {
    const messageItem = data.output.find((item: any) => item.type === 'message');
    if (messageItem?.content) {
      const textContent = messageItem.content.find((c: any) => c.type === 'output_text');
      outputText = textContent?.text;
    }
  }

  if (!outputText) {
    throw new Error('Keine Antwort vom KI-Modell erhalten');
  }

  return outputText;
}

// Phase 3: Generate roles with learning_environment connections
export async function generateRolesForActivities(
  template: any,
  model: string,
  apiKey: string,
  addStatus: (message: string) => void
): Promise<any> {
  addStatus('🔗 Verknüpfe Rollen mit Lernumgebungen...');

  const environments = template.environments || [];
  const actors = template.actors || [];
  const sequences = template.solution?.didactic_template?.learning_sequences || [];

  if (environments.length === 0 || actors.length === 0 || sequences.length === 0) {
    addStatus('⚠️ Keine Umgebungen/Akteure/Sequenzen vorhanden');
    return template;
  }

  // Build context for KI
  const envSummary = environments.map((env: any) => ({
    id: env.id,
    name: env.name,
    materials: (env.materials || []).map((m: any) => ({ id: m.id, name: m.name, type: m.material_type })),
    tools: (env.tools || []).map((t: any) => ({ id: t.id, name: t.name })),
    services: (env.services || []).map((s: any) => ({ id: s.id, name: s.name }))
  }));

  const actorSummary = actors.map((a: any) => ({ 
    id: a.id, 
    name: a.name, 
    type: a.type,
    differentiation_options: a.differentiation_options || []
  }));

  // Collect all activities
  const activities: any[] = [];
  sequences.forEach((seq: any) => {
    (seq.phases || []).forEach((phase: any) => {
      (phase.activities || []).forEach((act: any) => {
        activities.push({
          activity_id: act.activity_id,
          name: act.name,
          description: act.description,
          phase_name: phase.phase_name,
          existing_roles: act.roles || []
        });
      });
    });
  });

  const prompt = `Vervollständige die Rollen für diese Aktivitäten mit korrekter Verknüpfung zur Lernumgebung.

AKTEURE (mit Differenzierungsoptionen):
${JSON.stringify(actorSummary, null, 2)}

LERNUMGEBUNGEN (mit Materialien, Tools, Services):
${JSON.stringify(envSummary, null, 2)}

AKTIVITÄTEN:
${JSON.stringify(activities, null, 2)}

Für JEDE Aktivität erstelle Rollen mit dieser EXAKTEN Struktur:
{
  "activity_id": "...",
  "roles": [
    {
      "role_id": "<activity_id>-R1",
      "role_name": "Konkreter Rollenname (z.B. Moderation, Anleitung, Bearbeitung)",
      "actor_id": "A1 oder A2",
      "task_description": "Konkrete Aufgabe bezogen auf die Aktivität",
      "selected_differentiation": ["diff_id1", "diff_id2"],
      "learning_environment": {
        "environment_id": "ENV1",
        "selected_materials": ["ENV1-M1", "ENV1-M2"],
        "selected_tools": ["ENV1-T1"],
        "selected_services": []
      }
    }
  ]
}

WICHTIG - BINNENDIFFERENZIERUNG:
- Wenn ein Akteur differentiation_options hat, wähle passende IDs für selected_differentiation
- Bei Lerngruppen (Typ "Gruppe") sollten relevante Differenzierungsoptionen zugewiesen werden
- Z.B. bei Übungsaktivitäten: Leistungsträger und Förderbedarf berücksichtigen
- selected_differentiation enthält die IDs der ausgewählten Optionen aus dem Akteur

WICHTIG - INDIVIDUELLE MATERIALZUORDNUNG:
- JEDE Aktivität hat UNTERSCHIEDLICHE Inhalte basierend auf ihrer Beschreibung!
- NICHT die gleichen Materialien für alle Aktivitäten verwenden!
- Wähle Materialien die ZUR AKTIVITÄTSBESCHREIBUNG PASSEN:
  - "Zahlenspiel" → Bildkarten, Visualisierungen
  - "Regelentdeckung Zahlengerade" → Zahlengerade-Materialien
  - "Partnerübung" → Arbeitsblätter, Übungen
  - "Präsentation/Selbsttest" → Quiz, Tests
- Jede Rolle MUSS learning_environment haben
- Lehrperson: Präsentationen, Leitfäden passend zur Aktivität
- Lernende: Arbeitsblätter, Quiz, Videos passend zur Aktivität
- Verwende NUR existierende IDs aus den Lernumgebungen oben!

Antworte mit einem JSON-Array aller Aktivitäten mit ihren vervollständigten Rollen.`;

  try {
    const outputText = await callGPT(
      apiKey,
      model,
      'Du bist ein Didaktik-Experte. Erstelle Rollen mit korrekten Ressourcen-Verknüpfungen. Antworte nur mit validem JSON.',
      prompt,
      6000
    );

    const jsonMatch = outputText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      addStatus('⚠️ Konnte Rollen nicht parsen');
      return template;
    }

    const rolesData = JSON.parse(jsonMatch[0]);
    
    // Merge roles back into template
    const updatedSequences = sequences.map((seq: any) => ({
      ...seq,
      phases: (seq.phases || []).map((phase: any) => ({
        ...phase,
        activities: (phase.activities || []).map((act: any) => {
          const roleUpdate = rolesData.find((r: any) => r.activity_id === act.activity_id);
          if (roleUpdate?.roles) {
            return { ...act, roles: roleUpdate.roles };
          }
          return act;
        })
      }))
    }));

    template.solution.didactic_template.learning_sequences = updatedSequences;
    addStatus(`✅ ${rolesData.length} Aktivitäten mit Rollen verknüpft`);
    
    return template;
  } catch (error) {
    addStatus(`⚠️ Rollen-Verknüpfung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannt'}`);
    return template;
  }
}

export async function generateTemplate(
  currentTemplate: any,
  userInput: string,
  model: string,
  apiKey: string,
  _learnFromCommunity: boolean,
  addStatus: (message: string) => void
) {
  addStatus('🔧 Erstelle KI-Prompt...');

  const prompt = `Du bist ein erfahrener didaktischer Assistent. Erstelle oder vervollständige ein Lernpfad-Template.

GRUNDLEGENDE KONZEPTE - WICHTIG ZU VERSTEHEN:

1. LERNSEQUENZ (learning_sequence):
   = Der gesamte Ablauf einer Unterrichtseinheit (45-90 Minuten)
   - Enthält mehrere PHASEN
   
   BENENNUNG: Thematischer oder inhaltlicher Titel, kann auch Methodik enthalten
   GUTE Beispiele:
   - "Einführung in die Addition"
   - "Waldspaziergang mit Tier- und Pflanzenkunde"
   - "Einstieg in die Algebra"
   - "Bruchrechnung entdecken"
   - "Ökosystem Wald erkunden"
   
   SCHLECHTE Beispiele (VERBOTEN):
   - "Lernsequenz 1" ❌
   - "Unterrichtseinheit" ❌

2. PHASE (phase innerhalb einer Sequenz):
   = Ein Abschnitt/Teil des Unterrichtsablaufs
   - Jede Phase enthält 1-3 AKTIVITÄTEN
   
   BENENNUNG: Kurzer Zweck-Begriff als Name, Beschreibung separat
   
   phase_name (kurz):     | learning_goal (Beschreibung):
   ---------------------- | ------------------------------
   "Aktivierung"          | "Vorwissen aktivieren mit Bildkarten"
   "Einstieg"             | "Interesse wecken durch Alltagsbeispiele"
   "Erarbeitung"          | "Selbstständige Entdeckung der Additionsregeln"
   "Übung"                | "Festigung durch differenzierte Aufgaben"
   "Vertiefung"           | "Transfer auf komplexere Problemstellungen"
   "Sicherung"            | "Gemeinsame Reflexion und Ergebnissicherung"
   "Transfer"             | "Anwendung auf neue Kontexte"
   
   SCHLECHTE Beispiele (VERBOTEN):
   - "Phase 1" ❌
   - "Einstieg: Vorwissen aktivieren" ❌ (Beschreibung gehört in learning_goal)

3. AKTIVITÄT (activity):
   = Eine konkrete Lehr- oder Lernaktivität
   - WAS genau passiert in diesem Moment
   
   BENENNUNG: Beschreibende, themenspezifische Namen
   GUTE Beispiele:
   - "Zahlenspiel"
   - "Regelentdeckung"
   - "Partnerarbeit: Additionsaufgaben"
   - "Quiz zur Selbstkontrolle"
   - "Präsentation und Diskussion"
   - "Bildkarten-Memory"
   
   SCHLECHTE Beispiele (VERBOTEN):
   - "Aktivität" ❌
   - "Übung" ❌ (zu generisch)

4. ROLLE (actor_role innerhalb einer Aktivität):
   = Die konkrete Aufgabe eines Akteurs IN dieser Aktivität
   
   GUTE Beispiele für task_description:
   - Lehrperson: "Leitet das Zahlenspiel und stellt gezielte Fragen"
   - Lehrperson: "Unterstützt den Entdeckungsprozess und gibt Hilfestellung"
   - Lernende: "Aktive Teilnahme am Zahlenspiel"
   - Lernende: "Erarbeitet die Regeln in Partnerarbeit"
   
   SCHLECHTE Beispiele (VERBOTEN):
   - "Bearbeitet 'Aktivität'" ❌
   - "Erklärt und präsentiert 'Aktivität'" ❌

REFERENZ-BEISPIEL (orientiere dich daran):
Lernsequenz: "Einführung in die Addition"
├── Phase: "Aktivierung" (learning_goal: "Vorwissen aktivieren und Interesse wecken")
│   └── Aktivität: "Zahlenspiel"
│       ├── Lehrperson: "Leitet das Zahlenspiel und stellt gezielte Fragen"
│       └── Lernende: "Aktive Teilnahme am Zahlenspiel"
├── Phase: "Erarbeitung" (learning_goal: "Selbstständige Erarbeitung der Additionsregeln")
│   ├── Aktivität: "Regelentdeckung"
│   │   ├── Lehrperson: "Unterstützt den Entdeckungsprozess und gibt Hilfestellung"
│   │   └── Lernende: "Erarbeitet die Regeln in Partnerarbeit"
│   └── Aktivität: "Übungsphase"
│       ├── Lehrperson: "Beobachtet und unterstützt bei Bedarf"
│       └── Lernende: "Bearbeitet Übungsaufgaben selbstständig"
└── Phase: "Sicherung" (learning_goal: "Gemeinsame Reflexion und Sicherung der Erkenntnisse")
    └── Aktivität: "Präsentation und Diskussion"
        ├── Lehrperson: "Moderiert die Diskussion und fasst Ergebnisse zusammen"
        └── Lernende: "Stellt Erkenntnisse vor und beteiligt sich an Diskussion"

AKTUELLES TEMPLATE (vollständig):
${JSON.stringify(currentTemplate, null, 2)}

NUTZER-ANWEISUNGEN:
${userInput}

WICHTIGE ANFORDERUNGEN:

1. MATERIALIEN - DIGITALE LERNRESSOURCEN aus WLO (wirlernenonline.de):
   
   ⚠️ WICHTIG: EINFACHE, KURZE NAMEN für bessere WLO-Suche!
   
   MATERIAL-NAMEN müssen KURZ und EINFACH sein (2-4 Wörter):
   ✅ GUTE Namen: "Bildkarten Addition", "Zahlengerade", "Rechenaufgaben Klasse 1", "Einmaleins Übungen"
   ❌ SCHLECHTE Namen: "Digitales Arbeitsblatt: Rechenstreifen und Zählaufgaben", "Methodenblatt: Sprachfördernde Unterrichtsmethoden"
   
   search_query = Gleich wie name, OHNE Präfixe wie "Arbeitsblatt:", "Video:" etc.
   
   VERFÜGBARE INHALTSTYPEN (material_type):
   - "Video" - Erklärvideos, Tutorials
   - "Interaktives Medium" - H5P, Simulationen
   - "Lernspiel" - LearningApps, Spiele
   - "Arbeitsblatt" - Übungsblätter
   - "Bild" - Bildkarten, Grafiken
   - "Übungsmaterial" - Digitale Übungen
   - "Präsentation" - Folien
   
   BEISPIELE für name UND search_query:
   - "Bildkarten Addition" (nicht: "Bildgestützte Materialien für den Einstieg in die Addition")
   - "Zahlengerade bis 20" (nicht: "Interaktives Arbeitsblatt zur Orientierung an der Zahlengerade")
   - "Einmaleins Quiz" (nicht: "Digitaler Selbsttest zum kleinen Einmaleins mit Feedback")
   - "Bruchrechnung Animation" (nicht: "Erklärvideo zur Einführung in die Bruchrechnung")

2. LERNUMGEBUNGEN - NUR LERNORT, KEINE RESSOURCEN IM NAMEN:
   
   ⚠️ WICHTIG: Lernumgebung = NUR der physische/virtuelle Lernort!
   ✅ GUTE Namen: "Klassenzimmer", "Computerraum", "Schulhof", "LMS-Kursraum", "Digitales Klassenzimmer"
   ❌ SCHLECHTE Namen: "Klassenzimmer mit WLO-Ressourcen", "Digitaler Lernraum mit interaktiven Materialien"

{
  "id": "ENV1",
  "name": "Klassenzimmer",
  "description": "Präsenzunterricht im Klassenraum",
  "materials": [
    {
      "id": "ENV1-M1",
      "name": "Eiszeit Bilder",
      "material_type": "Bild",
      "source": "manual",
      "access_link": "",
      "search_query": "Eiszeit"
    }
  ],
  "tools": [
    { "id": "ENV1-T1", "name": "Beamer", "tool_type": "Präsentationstechnik", "source": "manual", "access_link": "" }
  ],
  "services": []
}

   ⚠️ search_query = NUR das Thema, OHNE Inhaltstyp!
   - name: "Eiszeit Präsentation" → search_query: "Eiszeit" (material_type: "Präsentation")
   - name: "Addition Video" → search_query: "Addition" (material_type: "Video")
   - name: "Klimawandel Quiz" → search_query: "Klimawandel" (material_type: "Tests / Fragebögen")

3. AKTEURE - Standard und Teilgruppen:
   
   STANDARD-AKTEURE (wenn keine anderen Angaben):
   - "A1": Lehrperson (type: "Einzelperson", Lehrkraft die den Unterricht leitet)
   - "A2": Lernende (type: "Gruppe", die Hauptgruppe der Schüler/Studierenden)
   
   WICHTIG - TEILGRUPPEN ALS EIGENE AKTEURE:
   Wenn im Prompt spezielle Teilgruppen erwähnt werden (z.B. "Schüler mit Sprachproblemen", 
   "DaZ-Schüler", "Förderschüler", "leistungsstarke Schüler"), dann:
   → Diese Teilgruppen als SEPARATE Akteure anlegen!
   
   Beispiel bei Erwähnung von "Schülern mit Sprachförderbedarf":
   - "A1": Lehrperson (type: "Einzelperson")
   - "A2": Hauptlerngruppe (type: "Gruppe", die regulären Schüler)
   - "A3": Sprachfördergruppe (type: "Gruppe", Schüler mit Sprachförderbedarf)
   
   Beispiel bei "Lernen durch Lehren" (nur Lernende):
   - "A1": Tutoren (type: "Gruppe", Schüler die unterrichten)
   - "A2": Lernende (type: "Gruppe", Schüler die lernen)
   
   Jeder Akteur VOLLSTÄNDIG definieren mit:
   - demographic_data (age/age_range, gender/gender_distribution)
   - education (education_level, class_level, subject_focus)
   - competencies (subject_, cognitive_, methodical_, affective_, digital_competencies, language_skills)
   - learning_requirements (learning_preferences, special_needs, technical_requirements)
   - interests_and_goals (interests, goals, motivation)
   - social_structure (group_size, heterogeneity)
   
   Bei Teilgruppen: special_needs entsprechend setzen (z.B. ["Sprachförderung", "DaZ"])

4. LERNSEQUENZEN UND AKTIVITÄTEN - PFLICHTFELDER:
   
   JEDE LERNSEQUENZ MUSS HABEN:
   - sequence_name: Thematischer Titel (NICHT "Lernsequenz 1"!)
   - time_frame: z.B. "45 Minuten" oder "90 Minuten"
   
   JEDE PHASE MUSS HABEN:
   - phase_name: Kurzer Zweck-Begriff (z.B. "Einstieg", "Erarbeitung")
   - time_frame: z.B. "10 Minuten"
   - learning_goal: Beschreibung des Lernziels
   
   JEDE AKTIVITÄT MUSS HABEN:
   - name: Beschreibender Name (NICHT "Aktivität"!)
   - description: Was passiert konkret
   - duration: Zahl in Minuten (5-20, NIEMALS 0!)
   
   ZEITANGABEN-REGELN:
   - Schulstunde: 45 Minuten gesamt
   - Aktivitäten: 5-20 Minuten (Summe = Phasenzeit)
   
   BEISPIEL-STRUKTUR:
   {
     "sequence_name": "Einführung in die Addition",
     "time_frame": "45 Minuten",
     "phases": [{
       "phase_name": "Einstieg",
       "time_frame": "10 Minuten",
       "learning_goal": "Vorwissen aktivieren",
       "activities": [{
         "name": "Zahlenrätsel",
         "description": "Knobeln mit Additionsaufgaben",
         "duration": 10
       }]
     }]
   }

5. MATERIAL-ZUORDNUNG nach Akteur:
   LERNENDE (A2) erhalten:
   - Interaktive Arbeitsblätter zum Bearbeiten
   - Quiz und Selbsttests
   - Erklärvideos zum Ansehen
   - Simulationen zum Experimentieren
   - Übungsmaterialien
   
   LEHRENDE (A1) erhalten:
   - Präsentationen als Unterrichtshilfe
   - Lehrerleitfäden
   - Lösungsblätter
   - Bewertungsraster
   
   In material_refs: Materialien dem richtigen Akteur zuordnen!

6. DIDAKTISCHE QUALITÄT:
   - Klare Lernziele
   - Sinnvoller Aufbau (Einstieg → Erarbeitung → Sicherung)
   - Differenzierungsmöglichkeiten
   - Passende Methoden für Zielgruppe

Generiere ein vollständiges, didaktisch hochwertiges Template als JSON-Objekt.`;

  addStatus('🚀 Sende Anfrage an KI-Modell...');

  try {
    // GPT-5 Responses API via fetch
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: "Du bist ein erfahrener Didaktik-Experte. Erstelle strukturierte Lernpfad-Templates. Antworte immer mit validem JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_output_tokens: 12000,
        reasoning: { effort: "medium" }
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Fehler: ${apiResponse.status}`);
    }

    const response = await apiResponse.json();
    addStatus('✅ KI-Antwort erhalten');

    // GPT-5 Responses API: output_text oder output[].content[].text
    let outputText = response.output_text;
    
    // Fallback: Parse output array if output_text not available
    if (!outputText && response.output) {
      const messageItem = response.output.find((item: any) => item.type === 'message');
      if (messageItem?.content) {
        const textContent = messageItem.content.find((c: any) => c.type === 'output_text');
        outputText = textContent?.text;
      }
    }

    if (!outputText) {
      console.error('GPT-5 Response structure:', JSON.stringify(response, null, 2));
      throw new Error('Keine Antwort vom KI-Modell erhalten');
    }

    // Extract JSON from response
    const jsonMatch = outputText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Kein gültiges JSON in der KI-Antwort gefunden');
    }

    let jsonString = jsonMatch[0];
    
    // Try to fix common JSON errors
    let generatedTemplate;
    try {
      generatedTemplate = JSON.parse(jsonString);
    } catch (parseError) {
      addStatus('⚠️ JSON-Reparatur wird versucht...');
      
      // Fix 1: Remove trailing commas before } or ]
      jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix 2: Convert unquoted text numbers to actual numbers (e.g., thirty -> 30, thirty_five -> 35)
      const tens: Record<string, number> = {
        'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 
        'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
      };
      const ones: Record<string, number> = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9
      };
      const simpleNumbers: Record<string, number> = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
        'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
        'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
        'eighty': 80, 'ninety': 90, 'hundred': 100
      };
      
      // First handle compound numbers like "thirty_five" or "thirty-five" or "thirty five"
      for (const [ten, tenVal] of Object.entries(tens)) {
        for (const [one, oneVal] of Object.entries(ones)) {
          const compound = tenVal + oneVal;
          jsonString = jsonString.replace(new RegExp(`:\\s*${ten}[_\\-\\s]${one}\\b`, 'gi'), `: ${compound}`);
        }
      }
      
      // Then handle simple numbers (e.g., "age": thirty -> "age": 30)
      for (const [text, num] of Object.entries(simpleNumbers)) {
        jsonString = jsonString.replace(new RegExp(`:\\s*${text}\\b`, 'gi'), `: ${num}`);
      }
      
      // Fix 3: Fix unescaped quotes in strings (common AI mistake)
      // Replace \" with a placeholder, then fix unescaped quotes, then restore
      jsonString = jsonString.replace(/\\"/g, '§ESCAPED_QUOTE§');
      jsonString = jsonString.replace(/"([^"]*)"(\s*:\s*)"([^"]*)(?<!\\)"([^"]*)"(?=\s*[,}\]])/g, 
        (_match: string, key: string, sep: string, val1: string, val2: string) => `"${key}"${sep}"${val1}'${val2}"`);
      jsonString = jsonString.replace(/§ESCAPED_QUOTE§/g, '\\"');
      
      // Fix 3: Remove control characters
      jsonString = jsonString.replace(/[\x00-\x1F\x7F]/g, (char: string) => {
        if (char === '\n' || char === '\r' || char === '\t') return char;
        return '';
      });
      
      // Fix 4: Ensure proper string termination - truncate at last valid closing brace
      const lastBrace = jsonString.lastIndexOf('}');
      if (lastBrace > 0) {
        jsonString = jsonString.substring(0, lastBrace + 1);
      }
      
      try {
        generatedTemplate = JSON.parse(jsonString);
        addStatus('✅ JSON erfolgreich repariert');
      } catch (secondError) {
        // Log problematic section for debugging
        const errorMsg = secondError instanceof Error ? secondError.message : 'Unknown';
        const posMatch = errorMsg.match(/position (\d+)/);
        if (posMatch) {
          const pos = parseInt(posMatch[1]);
          const context = jsonString.substring(Math.max(0, pos - 100), Math.min(jsonString.length, pos + 100));
          console.error('JSON error context:', context);
        }
        throw new Error(`JSON-Parsing fehlgeschlagen: ${errorMsg}`);
      }
    }

    // Log summary
    addStatus(`\n📋 Generiert:`);
    addStatus(`- ${generatedTemplate.actors?.length || 0} Akteure`);
    addStatus(`- ${generatedTemplate.environments?.length || 0} Lernumgebungen`);
    if (generatedTemplate.solution?.didactic_template?.learning_sequences) {
      addStatus(`- ${generatedTemplate.solution.didactic_template.learning_sequences.length} Lernsequenzen`);
    }

    // Validate the template
    addStatus('🔍 Validiere...');
    const validatedTemplate = validateTemplate(generatedTemplate);

    return validatedTemplate;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    addStatus(`\n❌ Fehler: ${errorMessage}`);
    throw error;
  }
}