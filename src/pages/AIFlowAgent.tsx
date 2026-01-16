import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTemplateStore, DifferentiationOption, Actor } from '../store/templateStore';
import { SaveLoad } from '../components/SaveLoad';
import { generateTemplate, generateRolesForActivities } from '../lib/templateGenerator';
import { processActivitiesForWLOContent } from '../lib/wloContentSuggester';
import { 
  SparklesIcon, 
  Cog6ToothIcon, 
  PlayIcon, 
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  AcademicCapIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { Mic, MicOff, Loader2 } from 'lucide-react';

export default function AIFlowAgent() {
  const state = useTemplateStore();
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Settings from localStorage
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-5-mini');

  // Process options
  const [useKIFlow, setUseKIFlow] = useState(true);
  const [useWLOInhalte, setUseWLOInhalte] = useState(true);
  const [useDifferenzierung, setUseDifferenzierung] = useState(true);

  // OpenAI Whisper Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const baseInputRef = useRef('');

  // OpenAI Whisper API für Transkription
  const transcribeWithWhisper = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'de');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API Fehler: ${response.status}`);
    }

    const result = await response.json();
    return result.text || '';
  };

  // Aufnahme starten
  const startRecording = async () => {
    if (!apiKey) {
      setSpeechError('Bitte konfigurieren Sie zuerst den OpenAI API-Key in den Einstellungen.');
      return;
    }

    setSpeechError(null);
    baseInputRef.current = userInput;
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Chunk jede Sekunde
      setIsRecording(true);

    } catch (err) {
      setSpeechError('Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff.');
    }
  };

  // Aufnahme stoppen und transkribieren
  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    setIsRecording(false);
    setIsTranscribing(true);

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        // Stream stoppen
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioChunksRef.current.length === 0) {
          setIsTranscribing(false);
          resolve();
          return;
        }

        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const text = await transcribeWithWhisper(audioBlob);
          
          if (text) {
            const base = baseInputRef.current;
            setUserInput(base + (base ? ' ' : '') + text.trim());
          }
        } catch (err: any) {
          setSpeechError(err.message || 'Fehler bei der Transkription');
        } finally {
          setIsTranscribing(false);
          audioChunksRef.current = [];
        }
        resolve();
      };

      mediaRecorderRef.current!.stop();
    });
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else if (!isTranscribing) {
      await startRecording();
    }
  };

  // WLO Filter Settings
  const [wloFilterSubject, setWloFilterSubject] = useState(false);
  const [wloFilterEducationalLevel, setWloFilterEducationalLevel] = useState(false);

  // Load settings - environment variable takes priority over localStorage
  useEffect(() => {
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    const storedApiKey = localStorage.getItem('openai_api_key') || '';
    const storedModel = localStorage.getItem('openai_model') || 'gpt-5-mini';
    const storedWloFilterSubject = localStorage.getItem('wlo_filter_subject') === 'true';
    const storedWloFilterEducationalLevel = localStorage.getItem('wlo_filter_educational_level') === 'true';
    setApiKey(envApiKey || storedApiKey);
    setModel(storedModel);
    setWloFilterSubject(storedWloFilterSubject);
    setWloFilterEducationalLevel(storedWloFilterEducationalLevel);
  }, []);

  
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

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, message]);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setError('Verarbeitung wurde abgebrochen');
      addStatus('\n❌ Verarbeitung abgebrochen');
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!apiKey) {
      setError('Bitte konfigurieren Sie Ihren API-Schlüssel in den Einstellungen');
      return;
    }

    if (!userInput && useKIFlow) {
      setError('Bitte geben Sie Ihre Anweisungen ein');
      return;
    }

    if (!useKIFlow && !useWLOInhalte) {
      setError('Bitte wählen Sie mindestens eine Option');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setStatus([]);
    abortControllerRef.current = new AbortController();

    try {
      let updatedTemplate = currentTemplate;

      // Step 1: Generate template with AI (if enabled)
      if (useKIFlow) {
        addStatus('🤖 Starte KI-gestützte Template-Generierung...');
        const generatedTemplate = await generateTemplate(
          currentTemplate,
          userInput,
          model,
          apiKey,
          false,
          addStatus
        );

        updatedTemplate = generatedTemplate;
        
        // Update store
        state.setMetadata(generatedTemplate.metadata);
        state.setProblem(generatedTemplate.problem);
        state.setContext(generatedTemplate.context);
        state.setInfluenceFactors(generatedTemplate.influence_factors);
        state.setSolution(generatedTemplate.solution);
        state.setConsequences(generatedTemplate.consequences);
        state.setImplementationNotes(generatedTemplate.implementation_notes);
        state.setRelatedPatterns(generatedTemplate.related_patterns);
        state.setFeedback(generatedTemplate.feedback);
        state.setSources(generatedTemplate.sources);
        state.setActors(generatedTemplate.actors);
        state.setEnvironments(generatedTemplate.environments);

        addStatus('✅ Template-Generierung abgeschlossen');
      }

      // Step 2: Generate roles with learning_environment connections FIRST
      // This ensures roles are linked to environments before WLO content processing
      if (useKIFlow && updatedTemplate.environments?.length > 0) {
        addStatus('\n🔗 Phase 2: Verknüpfe Rollen mit Lernumgebungen...');
        const templateWithRoles = await generateRolesForActivities(
          updatedTemplate,
          model,
          apiKey,
          addStatus
        );
        
        // Update template and store with new roles
        if (templateWithRoles.solution) {
          updatedTemplate.solution = templateWithRoles.solution;
          state.setSolution(templateWithRoles.solution);
        }
      }

      // Step 2.5: Generate differentiation options for group actors (PARALLEL)
      if (useDifferenzierung) {
        const groupActors = updatedTemplate.actors?.filter((a: Actor) => a.type === 'Gruppe') || [];
        const actorsToProcess = groupActors.filter(
          actor => !actor.differentiation_options || actor.differentiation_options.length === 0
        );
        
        if (groupActors.length === 0) {
          addStatus('\n⚠️ Keine Gruppen-Akteure vorhanden - überspringe Binnendifferenzierung');
        } else if (actorsToProcess.length === 0) {
          addStatus('\n⏭️ Alle Gruppen-Akteure haben bereits Differenzierungsoptionen');
        } else {
          addStatus(`\n👥 Phase 2.5: Generiere Binnendifferenzierung für ${actorsToProcess.length} Lerngruppen (parallel)...`);
          
          // Process all actors in parallel
          const diffPromises = actorsToProcess.map(async (actor) => {
            const diffPrompt = buildDifferentiationPrompt(actor, updatedTemplate);
            
            try {
              const systemPrompt = `Du bist ein Experte für Binnendifferenzierung im Unterricht. 
Generiere konkrete, umsetzbare Differenzierungsoptionen für heterogene Lerngruppen.
Antworte NUR mit einem JSON-Array im folgenden Format:
[
  {
    "label": "Kurzname der Zielgruppe",
    "description": "Kurze Beschreibung",
    "hints": ["Hinweis 1", "Hinweis 2", "Hinweis 3"]
  }
]
Die Hinweise sollten kurze, praktische Umsetzungstipps sein (max. 1-2 Sätze).`;

              const response = await fetch('https://api.openai.com/v1/responses', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                  model,
                  input: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: diffPrompt }
                  ],
                  max_output_tokens: 2000
                })
              });

              if (response.ok) {
                const data = await response.json();
                
                // Extract output_text (same as templateGenerator.ts)
                let content = data.output_text || '';
                
                if (!content && data.output) {
                  const messageItem = data.output.find((item: any) => item.type === 'message');
                  if (messageItem?.content) {
                    const textContent = messageItem.content.find((c: any) => c.type === 'output_text');
                    content = textContent?.text || '';
                  }
                }
                
                if (!content) {
                  return { actorId: actor.id, actorName: actor.name, options: [], success: false, error: 'no_output', detail: 'Keine Antwort erhalten' };
                }
                
                try {
                  const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
                  const parsed = JSON.parse(cleanContent);
                  const options: DifferentiationOption[] = (Array.isArray(parsed) ? parsed : []).map((opt: any, idx: number) => ({
                    id: `diff_${actor.id}_${Date.now()}_${idx}`,
                    label: opt.label || 'Option',
                    description: opt.description || '',
                    hints: opt.hints || []
                  }));
                  
                  if (options.length === 0) {
                    return { actorId: actor.id, actorName: actor.name, options: [], success: false, error: 'empty', detail: cleanContent.substring(0, 100) };
                  }
                  
                  return { actorId: actor.id, actorName: actor.name, options, success: true };
                } catch (e) {
                  console.error(`Diff parse error for ${actor.name}:`, content);
                  return { actorId: actor.id, actorName: actor.name, options: [], success: false, error: 'parse', detail: String(e) };
                }
              } else {
                const errorText = await response.text();
                console.error(`Diff API error for ${actor.name}:`, response.status, errorText);
                return { actorId: actor.id, actorName: actor.name, options: [], success: false, error: 'api', detail: errorText };
              }
            } catch (e) {
              console.error(`Diff network error for ${actor.name}:`, e);
              return { actorId: actor.id, actorName: actor.name, options: [], success: false, error: 'network', detail: String(e) };
            }
          });

          // Wait for all and update store
          const results = await Promise.all(diffPromises);
          
          // Collect successful results for linking
          const successfulResults: { actorId: string; actorName: string; options: DifferentiationOption[] }[] = [];
          
          for (const result of results) {
            if (result.success && result.options.length > 0) {
              state.updateActor(result.actorId, { differentiation_options: result.options });
              successfulResults.push(result);
              addStatus(`  ✅ ${result.options.length} Optionen für "${result.actorName}"`);
            } else {
              const detail = (result as any).detail ? `: ${(result as any).detail.substring(0, 100)}` : '';
              addStatus(`  ⚠️ Fehler für "${result.actorName}" (${(result as any).error || 'unknown'}${detail})`);
            }
          }
          
          // Link differentiation options to roles
          if (successfulResults.length > 0) {
            addStatus('\n🔗 Verknüpfe Differenzierungsoptionen mit Rollen...');
            
            const sequences = updatedTemplate.solution?.didactic_template?.learning_sequences || [];
            let linkedCount = 0;
            
            for (const sequence of sequences) {
              for (const phase of (sequence.phases || [])) {
                for (const activity of (phase.activities || [])) {
                  for (const role of (activity.roles || [])) {
                    // Find if this role's actor has differentiation options
                    const actorResult = successfulResults.find(r => r.actorId === role.actor_id);
                    if (actorResult && actorResult.options.length > 0) {
                      // Assign all differentiation option IDs to this role
                      role.selected_differentiation = actorResult.options.map(opt => opt.id);
                      linkedCount++;
                    }
                  }
                }
              }
            }
            
            // Update solution in store
            if (linkedCount > 0) {
              state.setSolution(updatedTemplate.solution);
              addStatus(`  ✅ ${linkedCount} Rollen mit Differenzierungsoptionen verknüpft`);
            }
          }
          
          addStatus('✅ Binnendifferenzierung abgeschlossen');
        }
      }

      // Step 3: WLO Content Processing - NEW per-activity/role approach
      if (useWLOInhalte) {
        addStatus('\n🌐 Starte WLO-Inhalte Suche pro Aktivität/Rolle...');
        
        // Check if we have activities with roles
        const sequences = updatedTemplate.solution?.didactic_template?.learning_sequences || [];
        const hasRoles = sequences.some((seq: any) => 
          seq.phases?.some((phase: any) => 
            phase.activities?.some((act: any) => act.roles?.length > 0)
          )
        );

        if (!hasRoles) {
          addStatus('⚠️ Keine Aktivitäten mit Rollen vorhanden - überspringe WLO-Suche');
        } else {
          // Process all activities/roles and get WLO content
          const { updatedEnvironments, roleContentAssignments } = await processActivitiesForWLOContent(
            updatedTemplate,
            apiKey,
            model,
            {
              useSubjectFilter: wloFilterSubject,
              useEducationalLevelFilter: wloFilterEducationalLevel
            },
            addStatus
          );

          // Update environments in store
          state.setEnvironments(updatedEnvironments);
          updatedTemplate.environments = updatedEnvironments;

          // Update roles with assigned materials
          if (roleContentAssignments.size > 0) {
            addStatus('\n🔗 Verknüpfe Materialien mit Rollen...');
            
            const updatedSequences = sequences.map((seq: any) => ({
              ...seq,
              phases: seq.phases?.map((phase: any) => ({
                ...phase,
                activities: phase.activities?.map((act: any) => ({
                  ...act,
                  roles: act.roles?.map((role: any) => {
                    const assignedMaterials = roleContentAssignments.get(role.role_id);
                    if (assignedMaterials && assignedMaterials.length > 0) {
                      // Merge with existing selected_materials
                      const existingMaterials = role.learning_environment?.selected_materials || [];
                      const allMaterials = [...new Set([...existingMaterials, ...assignedMaterials])];
                      
                      return {
                        ...role,
                        learning_environment: {
                          ...role.learning_environment,
                          selected_materials: allMaterials
                        }
                      };
                    }
                    return role;
                  })
                }))
              }))
            }));

            // Update solution with new role assignments
            const updatedSolution = {
              ...updatedTemplate.solution,
              didactic_template: {
                ...updatedTemplate.solution.didactic_template,
                learning_sequences: updatedSequences
              }
            };
            state.setSolution(updatedSolution);
            updatedTemplate.solution = updatedSolution;

            addStatus(`✅ ${roleContentAssignments.size} Rollen mit WLO-Inhalten verknüpft`);
          }

          addStatus('\n✅ WLO-Inhalte erfolgreich verarbeitet');
        }
      }

      setSuccess(true);
      setUserInput('');
      addStatus('\n🎉 Verarbeitung abgeschlossen!');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Verarbeitung wurde abgebrochen');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
        setError(errorMessage);
        addStatus(`\n❌ Fehler: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const isApiKeyConfigured = apiKey.length > 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KI-Assistent</h1>
            <p className="text-sm text-gray-500">Automatische Template-Generierung</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/settings"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            Einstellungen
          </Link>
          <SaveLoad />
        </div>
      </div>

      {/* API Key Warning */}
      {!isApiKeyConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium">API-Schlüssel nicht konfiguriert</p>
            <p className="text-amber-700 text-sm mt-1">
              Bitte konfigurieren Sie Ihren OpenAI API-Schlüssel in den{' '}
              <Link to="/settings" className="underline hover:no-underline">Einstellungen</Link>.
            </p>
          </div>
        </div>
      )}

      {/* Options Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* KI Flow Option */}
        <label 
          className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            useKIFlow 
              ? 'border-violet-500 bg-violet-50' 
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <input
            type="checkbox"
            checked={useKIFlow}
            onChange={(e) => setUseKIFlow(e.target.checked)}
            className="absolute top-4 right-4 w-5 h-5 text-violet-600 rounded"
          />
          <AcademicCapIcon className={`w-8 h-8 mb-3 ${useKIFlow ? 'text-violet-600' : 'text-gray-400'}`} />
          <h3 className="font-semibold text-gray-900">KI-Ablauf</h3>
          <p className="text-sm text-gray-600 mt-1">
            Generiert das komplette Template basierend auf Ihrer Beschreibung
          </p>
        </label>

        {/* Differentiation Option */}
        <label 
          className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            useDifferenzierung 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <input
            type="checkbox"
            checked={useDifferenzierung}
            onChange={(e) => setUseDifferenzierung(e.target.checked)}
            className="absolute top-4 right-4 w-5 h-5 text-indigo-600 rounded"
          />
          <UsersIcon className={`w-8 h-8 mb-3 ${useDifferenzierung ? 'text-indigo-600' : 'text-gray-400'}`} />
          <h3 className="font-semibold text-gray-900">Binnendifferenzierung</h3>
          <p className="text-sm text-gray-600 mt-1">
            Generiert Differenzierungsoptionen für Lerngruppen
          </p>
        </label>

        {/* WLO Content Option */}
        <label 
          className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            useWLOInhalte 
              ? 'border-violet-500 bg-violet-50' 
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <input
            type="checkbox"
            checked={useWLOInhalte}
            onChange={(e) => setUseWLOInhalte(e.target.checked)}
            className="absolute top-4 right-4 w-5 h-5 text-violet-600 rounded"
          />
          <BookOpenIcon className={`w-8 h-8 mb-3 ${useWLOInhalte ? 'text-violet-600' : 'text-gray-400'}`} />
          <h3 className="font-semibold text-gray-900">WLO-Inhalte</h3>
          <p className="text-sm text-gray-600 mt-1">
            Sucht ~30 Ressourcen pro Material und wählt die 5 besten per KI aus
          </p>
        </label>
      </div>

      {/* Input Section */}
      {useKIFlow && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Ihre Anweisungen</h2>
            <button
              type="button"
              onClick={() => setUserInput('Erstelle einen Lernpfad zum Thema Einführung in Addition für Kinder der 3. Klasse. Beachte bitte, das eine Teilgruppe der Schüler Sprachprobleme hat. Der Unterricht findet im Klassenraum während einer Unterrichtsstunde statt.')}
              className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors"
              disabled={loading}
            >
              📝 Beispiel laden
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Beschreiben Sie Ihren gewünschten Lernpfad...&#10;&#10;💡 Tipp: Beschreiben Sie Teilgruppen mit besonderen Bedürfnissen (z.B. Sprachprobleme, körperliche Einschränkungen) für die automatische Binnendifferenzierung.&#10;&#10;Beispiel: Erstelle einen Lernpfad zum Thema 'Addition' für die 3. Klasse. Eine Teilgruppe der Schüler hat Sprachprobleme."
                rows={6}
                className="w-full px-4 py-3 pr-14 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                disabled={loading || isRecording}
              />
              <button
                type="button"
                onClick={toggleRecording}
                disabled={loading}
                className={`absolute right-3 top-3 p-3 rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                    : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                }`}
                title={isRecording ? 'Aufnahme stoppen' : 'Spracheingabe starten'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* Recording/Transcribing Status */}
            {(isRecording || isTranscribing) && (
              <div className="flex items-center gap-2 text-sm font-medium">
                {isRecording ? (
                  <>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-600">Aufnahme läuft - sprechen Sie jetzt...</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                    <span className="text-violet-600">Transkribiere mit OpenAI Whisper...</span>
                  </>
                )}
              </div>
            )}

            {/* Speech Error */}
            {speechError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                {speechError}
              </div>
            )}

            {/* Backup hint */}
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>💡 Backup:</span>
              <kbd className="px-1 py-0.5 bg-gray-100 rounded border text-gray-600 font-mono">Win</kbd>
              <span>+</span>
              <kbd className="px-1 py-0.5 bg-gray-100 rounded border text-gray-600 font-mono">H</kbd>
              <span>für Windows-Diktierfunktion</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleProcess}
          disabled={loading || !isApiKeyConfigured || (!useKIFlow && !useWLOInhalte)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-medium hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verarbeitung läuft...
            </>
          ) : (
            <>
              <PlayIcon className="w-5 h-5" />
              Starten
            </>
          )}
        </button>
        
        {loading && (
          <button
            onClick={handleCancel}
            className="px-6 py-4 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition-colors"
          >
            <StopIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Status Messages */}
      {(status.length > 0 || error || success) && (
        <div className="bg-gray-900 rounded-2xl p-6 font-mono text-sm overflow-hidden">
          <div className="max-h-80 overflow-y-auto space-y-1">
            {status.map((msg, i) => (
              <div key={i} className="text-gray-300">{msg}</div>
            ))}
            {error && (
              <div className="flex items-center gap-2 text-red-400 mt-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-400 mt-2">
                <CheckCircleIcon className="w-4 h-4" />
                Erfolgreich abgeschlossen!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to build differentiation prompt
function buildDifferentiationPrompt(actor: Actor, template: any): string {
  const context = template.context || {};

  const specialNeedsArray = Array.isArray(actor.learning_requirements?.special_needs) 
    ? actor.learning_requirements.special_needs 
    : [];
  const hasSpecialNeeds = specialNeedsArray.length > 0;
  const specialNeeds = hasSpecialNeeds ? specialNeedsArray.join(', ') : 'keine spezifischen';

  // Different prompt based on whether this is a special needs group or regular group
  if (hasSpecialNeeds) {
    return `Generiere spezifische Unterstützungsmaßnahmen für folgende Fördergruppe:

**Gruppe:** ${actor.name}
**Spezifische Bedürfnisse:** ${specialNeeds}
**Fach:** ${context.subject || 'nicht angegeben'}

Diese Gruppe hat SPEZIFISCHE Förderbedarfe: ${specialNeeds}

Generiere 2-4 Maßnahmen, die GENAU auf "${specialNeeds}" zugeschnitten sind.

Beispiele je nach Bedarf:
- Körperliche Einschränkungen: "Barrierefreie Gestaltung", "Adaptierte Materialien"
- Sprachförderung: "Vereinfachte Sprache", "Visualisierte Anweisungen"
- Sehbehinderung: "Taktile Materialien", "Vergrößerte Darstellung"

Jede Maßnahme hat:
- label: Bezeichnung der METHODE
- description: Was diese Maßnahme beinhaltet
- hints: 2-3 konkrete Umsetzungshinweise`;
  }

  // For main group WITHOUT special needs - only performance-based differentiation
  return `Generiere leistungsbezogene Differenzierung für die Hauptlerngruppe:

**Gruppe:** ${actor.name} (Standardgruppe ohne besondere Förderbedarfe)
**Fach:** ${context.subject || 'nicht angegeben'}

WICHTIG: Dies ist die HAUPTGRUPPE ohne spezifische Förderbedarfe!
Generiere NUR leistungsbezogene Differenzierung, KEINE Fördermaßnahmen!

Erstelle genau 2 Maßnahmen:
1. "Erweiterung & Vertiefung" - für leistungsstarke Schüler (Zusatzaufgaben, Expertenrollen, selbstständige Vertiefung)
2. "Basisunterstützung" - für Schüler die mehr Zeit/Hilfe brauchen (kleinschrittige Anleitung, Partnerhilfe)

NICHT generieren für Hauptgruppe:
- Visuelle/taktile Unterstützung (nur bei Seh-/Motorikproblemen)
- Vereinfachte Sprache (nur bei Sprachförderbedarf)
- Barrierefreiheit (nur bei körperlichen Einschränkungen)

Jede Maßnahme hat:
- label: "Erweiterung & Vertiefung" oder "Basisunterstützung"
- description: Kurze Beschreibung
- hints: 2-3 konkrete Umsetzungshinweise`;
}
