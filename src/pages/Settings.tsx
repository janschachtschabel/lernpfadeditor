import { useState, useEffect } from 'react';
import { Cog6ToothIcon, KeyIcon, CpuChipIcon, CheckCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';

const AI_MODELS = [
  { id: 'gpt-5-mini', name: 'GPT-5 Mini (schnell, günstig)' },
  { id: 'gpt-5.2', name: 'GPT-5.2 (leistungsstark)' }
];

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-5-mini');
  const [saved, setSaved] = useState(false);
  
  // WLO Filter Settings
  const [wloFilterSubject, setWloFilterSubject] = useState(false);
  const [wloFilterEducationalLevel, setWloFilterEducationalLevel] = useState(false);

  // Check if API key is from environment variable
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  const isFromEnv = envApiKey.length > 0;

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key') || '';
    const storedModel = localStorage.getItem('openai_model') || 'gpt-5-mini';
    const storedWloFilterSubject = localStorage.getItem('wlo_filter_subject') === 'true';
    const storedWloFilterEducationalLevel = localStorage.getItem('wlo_filter_educational_level') === 'true';
    // Use env var if available, otherwise use stored value
    setApiKey(envApiKey || storedApiKey);
    setModel(storedModel);
    setWloFilterSubject(storedWloFilterSubject);
    setWloFilterEducationalLevel(storedWloFilterEducationalLevel);
  }, [envApiKey]);

  const handleSave = () => {
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('openai_model', model);
    localStorage.setItem('wlo_filter_subject', String(wloFilterSubject));
    localStorage.setItem('wlo_filter_educational_level', String(wloFilterEducationalLevel));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isApiKeySet = apiKey.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center">
          <Cog6ToothIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
          <p className="text-sm text-gray-500">API-Konfiguration für KI-Funktionen</p>
        </div>
      </div>

      {/* API Key Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">OpenAI API-Schlüssel</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Für die KI-gestützte Generierung benötigen Sie einen OpenAI API-Schlüssel. 
            Diesen können Sie unter <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">platform.openai.com</a> erstellen.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API-Schlüssel
              {isFromEnv ? (
                <span className="ml-2 text-blue-600 text-xs">🔒 Aus Umgebungsvariable</span>
              ) : isApiKeySet ? (
                <span className="ml-2 text-green-600 text-xs">✓ Gespeichert</span>
              ) : null}
            </label>
            <input
              type="password"
              value={isFromEnv ? '••••••••••••••••••••' : apiKey}
              onChange={(e) => !isFromEnv && setApiKey(e.target.value)}
              placeholder="sk-..."
              disabled={isFromEnv}
              className={`w-full px-4 py-3 rounded-xl border transition-all font-mono text-sm ${
                isFromEnv 
                  ? 'border-blue-200 bg-blue-50 text-blue-700 cursor-not-allowed' 
                  : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
            <p className="mt-2 text-xs text-gray-500">
              {isFromEnv 
                ? 'API-Schlüssel wird aus der Umgebungsvariable VITE_OPENAI_API_KEY geladen.'
                : 'Der Schlüssel wird lokal in Ihrem Browser gespeichert und nicht an unsere Server übertragen.'}
            </p>
          </div>
        </div>
      </div>

      {/* Model Selection Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CpuChipIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">KI-Modell</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Wählen Sie das KI-Modell für die Template-Generierung und Ressourcen-Bewertung.
          </p>
          <div className="space-y-2">
            {AI_MODELS.map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  model === m.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="model"
                  value={m.id}
                  checked={model === m.id}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="font-medium text-gray-900">{m.name}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* WLO Filter Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">WLO-Suchfilter</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Optionale Filter für die WLO-Suche. Wenn aktiviert, werden Fach und/oder Bildungsstufe 
            aus den allgemeinen Einstellungen als zusätzliche Filter verwendet.
          </p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={wloFilterSubject}
                onChange={(e) => setWloFilterSubject(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">Nach Fach filtern</div>
                <div className="text-xs text-gray-500">Nur Inhalte zum ausgewählten Fach anzeigen</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={wloFilterEducationalLevel}
                onChange={(e) => setWloFilterEducationalLevel(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">Nach Bildungsstufe filtern</div>
                <div className="text-xs text-gray-500">Nur Inhalte für die gewählte Bildungsstufe anzeigen</div>
              </div>
            </label>
          </div>
          <p className="text-xs text-gray-500">
            ⚠️ Aktivierte Filter können die Anzahl der Suchergebnisse reduzieren.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
          saved
            ? 'bg-green-500 text-white'
            : 'bg-indigo-500 text-white hover:bg-indigo-600'
        }`}
      >
        {saved ? (
          <>
            <CheckCircleIcon className="w-5 h-5" />
            Gespeichert!
          </>
        ) : (
          'Einstellungen speichern'
        )}
      </button>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Hinweis:</strong> Die Einstellungen werden im lokalen Speicher Ihres Browsers gespeichert. 
          Bei Verwendung eines anderen Browsers oder nach dem Löschen der Browserdaten müssen Sie die Einstellungen erneut eingeben.
        </p>
      </div>
    </div>
  );
}

export default Settings;
