import { useState } from 'react';
import { useTemplateStore, DifferentiationOption, Actor } from '../store/templateStore';
import { SaveLoad } from '../components/SaveLoad';

const AI_MODELS = [
  { id: 'gpt-5-mini', name: 'GPT-5 Mini (schnell)' },
  { id: 'gpt-5.2', name: 'GPT-5.2 (empfohlen)' },
];

interface GeneratedDiff {
  actorId: string;
  actorName: string;
  options: DifferentiationOption[];
}

export function DifferentiationAgent() {
  const state = useTemplateStore();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-5-mini');
  const [status, setStatus] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [generatedDiffs, setGeneratedDiffs] = useState<GeneratedDiff[]>([]);

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, message]);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      addStatus('❌ Bitte geben Sie einen OpenAI API Key ein');
      return;
    }

    const actorsWithGroups = state.actors.filter(a => a.type === 'Gruppe');
    if (actorsWithGroups.length === 0) {
      addStatus('❌ Keine Gruppen-Akteure gefunden. Binnendifferenzierung ist primär für Lerngruppen relevant.');
      return;
    }

    setProcessing(true);
    setStatus([]);
    setGeneratedDiffs([]);

    try {
      addStatus('🚀 Starte Generierung von Differenzierungsoptionen...\n');

      for (const actor of actorsWithGroups) {
        addStatus(`\n👥 Analysiere Akteur: ${actor.name}`);
        
        const prompt = buildPrompt(actor, state);
        
        addStatus('📝 Sende Anfrage an KI...');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: `Du bist ein Experte für Binnendifferenzierung im Unterricht. 
Generiere konkrete, umsetzbare Differenzierungsoptionen für heterogene Lerngruppen.
Antworte NUR mit einem JSON-Array im folgenden Format:
[
  {
    "label": "Kurzname der Zielgruppe",
    "description": "Kurze Beschreibung",
    "hints": ["Hinweis 1", "Hinweis 2", "Hinweis 3"]
  }
]
Die Hinweise sollten kurze, praktische Umsetzungstipps sein (max. 1-2 Sätze).`
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        });

        if (!response.ok) {
          throw new Error(`API-Fehler: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '[]';
        
        // Parse JSON from response
        let options: DifferentiationOption[] = [];
        try {
          const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
          options = parsed.map((opt: any, idx: number) => ({
            id: `diff_${actor.id}_${Date.now()}_${idx}`,
            label: opt.label || 'Option',
            description: opt.description || '',
            hints: opt.hints || []
          }));
          addStatus(`✅ ${options.length} Differenzierungsoptionen generiert`);
        } catch (e) {
          addStatus(`⚠️ Fehler beim Parsen der KI-Antwort`);
          console.error('Parse error:', e, content);
        }

        if (options.length > 0) {
          setGeneratedDiffs(prev => [...prev, {
            actorId: actor.id,
            actorName: actor.name,
            options
          }]);
        }
      }

      addStatus('\n✅ Generierung abgeschlossen! Übernehmen Sie die gewünschten Optionen.');
    } catch (error) {
      addStatus(`\n❌ Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleApply = (actorId: string, options: DifferentiationOption[]) => {
    const actor = state.actors.find(a => a.id === actorId);
    if (actor) {
      const existingOptions = actor.differentiation_options || [];
      state.updateActor(actorId, {
        differentiation_options: [...existingOptions, ...options]
      });
      addStatus(`✅ ${options.length} Optionen zu "${actor.name}" hinzugefügt`);
      setGeneratedDiffs(prev => prev.filter(d => d.actorId !== actorId));
    }
  };

  const handleApplyAll = () => {
    generatedDiffs.forEach(diff => {
      handleApply(diff.actorId, diff.options);
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Binnendifferenzierung generieren</h1>
          <p className="text-sm text-gray-500 mt-1">
            KI-gestützte Generierung von Differenzierungsoptionen für heterogene Lerngruppen
          </p>
        </div>
        <SaveLoad />
      </div>

      {/* Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">KI-Konfiguration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="sk-..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">KI-Modell</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {AI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actors Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Gruppen-Akteure</h2>
        {state.actors.filter(a => a.type === 'Gruppe').length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Keine Gruppen-Akteure vorhanden.</p>
            <p className="text-sm mt-1">Erstellen Sie zuerst Lerngruppen auf der Akteure-Seite.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.actors.filter(a => a.type === 'Gruppe').map(actor => (
              <div key={actor.id} className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-indigo-900">{actor.name}</h3>
                    <p className="text-sm text-indigo-700">
                      {actor.education.class_level} • {actor.social_structure.group_size} Personen • 
                      Heterogenität: {actor.social_structure.heterogeneity || 'k.A.'}
                    </p>
                    {actor.learning_requirements.special_needs.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Besondere Bedürfnisse: {actor.learning_requirements.special_needs.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-indigo-600">
                      {actor.differentiation_options?.length || 0} Optionen
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Results */}
      {generatedDiffs.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-green-800">Generierte Differenzierungsoptionen</h2>
            <button
              onClick={handleApplyAll}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Alle übernehmen
            </button>
          </div>
          <div className="space-y-6">
            {generatedDiffs.map(diff => (
              <div key={diff.actorId} className="border border-green-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-green-900">{diff.actorName}</h3>
                  <button
                    onClick={() => handleApply(diff.actorId, diff.options)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  >
                    Übernehmen
                  </button>
                </div>
                <div className="grid gap-3">
                  {diff.options.map(option => (
                    <div key={option.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-900">{option.label}</div>
                      <div className="text-sm text-green-700">{option.description}</div>
                      {option.hints.length > 0 && (
                        <ul className="mt-2 text-xs text-gray-600 space-y-1">
                          {option.hints.map((hint, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-green-500">•</span>
                              {hint}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Log */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Verarbeitungsstatus</h2>
        <div className="h-[200px] border rounded-lg overflow-y-auto bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap">
          {status.length > 0 ? (
            status.map((message, index) => (
              <div key={index}>{message}</div>
            ))
          ) : (
            <div className="text-gray-500">Klicken Sie auf "Generieren", um Differenzierungsoptionen zu erstellen...</div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={processing}
          className={`px-6 py-3 rounded-xl text-white font-medium ${
            processing
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600'
          } transition-colors`}
        >
          {processing ? 'Generiere...' : 'Differenzierungsoptionen generieren'}
        </button>
      </div>
    </div>
  );
}

function buildPrompt(actor: Actor, state: any): string {
  const context = state.context;
  const problem = state.problem;
  const sequences = state.solution?.didactic_template?.learning_sequences || [];

  return `Generiere Differenzierungsoptionen für folgende Lerngruppe:

**Lerngruppe:** ${actor.name}
**Klassenstufe:** ${actor.education.class_level}
**Bildungsniveau:** ${actor.education.education_level}
**Gruppengröße:** ${actor.social_structure.group_size}
**Heterogenität:** ${actor.social_structure.heterogeneity || 'mittel'}
**Besondere Bedürfnisse:** ${actor.learning_requirements.special_needs.join(', ') || 'keine angegeben'}
**Lernpräferenzen:** ${actor.learning_requirements.learning_preferences.join(', ') || 'keine angegeben'}

**Unterrichtskontext:**
- Fach: ${context.subject}
- Bildungsstufe: ${context.educational_level}
- Zeitrahmen: ${context.time_frame}
- Lernziele: ${problem.learning_goals.join(', ')}

**Unterrichtsablauf:**
${sequences.map((seq: any) => `- ${seq.sequence_name}: ${seq.learning_goal}`).join('\n')}

Erstelle 3-5 typische Differenzierungsoptionen für diese heterogene Lerngruppe. 
Berücksichtige verschiedene Leistungsniveaus, Lerntypen und besondere Förderbedarfe.
Jede Option sollte 2-4 konkrete, kurze Umsetzungshinweise enthalten.

Typische Kategorien:
- Leistungsträger/Schnelllerner
- Förderbedarf/Lernunterstützung
- Sprachförderung (DaZ)
- Verschiedene Lerntypen
- Inklusion/Barrierefreiheit`;
}
