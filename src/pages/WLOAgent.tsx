import { useState, useRef } from 'react';
import { useTemplateStore } from '../store/templateStore';
import { Editor } from '../components/Editor';
import { processResources } from '../components/wlo/ResourceProcessor';
import { SaveLoad } from '../components/SaveLoad';

const API_ENDPOINTS = {
  PRODUCTION: 'https://redaktion.openeduhub.net/edu-sharing/rest',
  STAGING: 'https://repository.staging.openeduhub.net/edu-sharing/rest'
} as const;

const DEFAULT_MAX_ITEMS = 5;

export function WLOAgent() {
  const state = useTemplateStore();
  const [status, setStatus] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [endpoint, setEndpoint] = useState<keyof typeof API_ENDPOINTS>('PRODUCTION');
  const [maxItems, setMaxItems] = useState(DEFAULT_MAX_ITEMS);
  const [combineMode, setCombineMode] = useState<'OR' | 'AND'>('AND');
  const [useNetlifyProxy, setUseNetlifyProxy] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Set environment variable for Netlify proxy
  if (typeof window !== 'undefined') {
    (window as any).process = {
      ...(window as any).process,
      env: {
        ...(window as any).process?.env,
        NETLIFY: useNetlifyProxy,
        WLO_PROXY_ENABLED: useNetlifyProxy ? 'true' : 'false'
      }
    };
  }

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, message]);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addStatus('\n❌ Verarbeitung wurde abgebrochen');
      setProcessing(false);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    setStatus([]);
    abortControllerRef.current = new AbortController();

    try {
      const environments = [...state.environments];
      
      for (const env of environments) {
        // Check if process was aborted
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        addStatus(`\n📂 Verarbeite Lernumgebung: ${env.name}`);

        // Process materials
        env.materials = await processResources(
          env.materials,
          'material',
          env.materials.map(m => m.id),
          env.name,
          addStatus,
          {
            endpoint: API_ENDPOINTS[endpoint],
            maxItems,
            combineMode,
            signal: abortControllerRef.current.signal
          }
        );

        // Process tools
        env.tools = await processResources(
          env.tools,
          'tool',
          env.tools.map(t => t.id),
          env.name,
          addStatus,
          {
            endpoint: API_ENDPOINTS[endpoint],
            maxItems,
            combineMode,
            signal: abortControllerRef.current.signal
          }
        );

        // Process services
        env.services = await processResources(
          env.services,
          'service',
          env.services.map(s => s.id),
          env.name,
          addStatus,
          {
            endpoint: API_ENDPOINTS[endpoint],
            maxItems,
            combineMode,
            signal: abortControllerRef.current.signal
          }
        );
      }

      state.setEnvironments(environments);
      addStatus('\n✅ Verarbeitung erfolgreich abgeschlossen');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        addStatus('\n❌ Verarbeitung wurde abgebrochen');
      } else {
        addStatus(`\n❌ Fehler bei der Verarbeitung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    } finally {
      setProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const currentTemplate = {
    metadata: state.metadata,
    problem: state.problem,
    context: state.context,
    influence_factors: state.influence_factors,
    solution: state.solution,
    consequences: state.consequences,
    implementation_notes: state.implementation_notes,
    related_patterns: state.related_patterns,
    feedback: state.feedback,
    sources: state.sources,
    actors: state.actors,
    environments: state.environments
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold">WLO Inhalte</h1>
        <SaveLoad />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">API-Konfiguration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">API-Umgebung</label>
            <select
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value as keyof typeof API_ENDPOINTS)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="PRODUCTION">Produktion (redaktion.openeduhub.net)</option>
              <option value="STAGING">Staging (repository.staging.openeduhub.net)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Aktueller Endpunkt: {API_ENDPOINTS[endpoint]}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Maximale Ergebnisse</label>
            <input
              type="number"
              value={maxItems}
              onChange={(e) => setMaxItems(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Verknüpfungsmodus</label>
            <select
              value={combineMode}
              onChange={(e) => setCombineMode(e.target.value as 'OR' | 'AND')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="AND">UND</option>
              <option value="OR">ODER</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CORS-Proxy</label>
            <div className="mt-1 flex items-center">
              <input
                type="checkbox"
                checked={useNetlifyProxy}
                onChange={(e) => setUseNetlifyProxy(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Netlify CORS-Fix aktivieren</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {useNetlifyProxy ? 'Verwendet Netlify Functions als Proxy' : 'Verwendet lokalen Proxy-Server'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Aktuelles Template</h2>
        <div className="h-[250px] border rounded-lg overflow-hidden">
          <Editor
            value={JSON.stringify(currentTemplate, null, 2)}
            onChange={() => {}}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Verarbeitungsstatus</h2>
        <div className="h-[20vh] border rounded-lg overflow-y-auto bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap">
          {status.length > 0 ? (
            status.map((message, index) => (
              <div key={index}>{message}</div>
            ))
          ) : (
            <div className="text-gray-500">Noch keine Verarbeitungsmeldungen vorhanden...</div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {processing && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600"
          >
            Abbrechen
          </button>
        )}
        <button
          onClick={handleProcess}
          disabled={processing}
          className={`px-4 py-2 rounded text-white ${
            processing
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {processing ? 'Verarbeite...' : 'Ressourcen verarbeiten'}
        </button>
      </div>
    </div>
  );
}