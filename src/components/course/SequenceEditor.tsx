import { LearningSequence } from '../../store/templateStore';
import { PhaseEditor } from './PhaseEditor';

interface SequenceEditorProps {
  sequence: LearningSequence;
  sequenceIndex: number;
  availableSequences: LearningSequence[];
  actors: any[];
  environments: any[];
  onUpdate: (updates: Partial<LearningSequence>) => void;
  onAddPhase: () => void;
  onUpdatePhase: (phaseIndex: number, updates: any) => void;
  onDeletePhase: (phaseIndex: number) => void;
}

export function SequenceEditor({
  sequence,
  sequenceIndex,
  availableSequences,
  actors,
  environments,
  onUpdate,
  onAddPhase,
  onUpdatePhase,
  onDeletePhase
}: SequenceEditorProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name der Sequenz</label>
            <input
              type="text"
              value={sequence.sequence_name}
              onChange={(e) => onUpdate({ sequence_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Zeitrahmen</label>
            <input
              type="text"
              value={sequence.time_frame}
              onChange={(e) => onUpdate({ time_frame: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Lernziel</label>
          <textarea
            value={sequence.learning_goal}
            onChange={(e) => onUpdate({ learning_goal: e.target.value })}
            rows={2}
            placeholder="z.B. Die Schüler verstehen die Grundlagen der Addition und können sie anwenden"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Voraussetzende Sequenzen</label>
          <select
            multiple
            value={sequence.prerequisite_learningsequences}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
              onUpdate({ prerequisite_learningsequences: selectedOptions });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            size={3}
          >
            {availableSequences.map(seq => (
              <option key={seq.sequence_id} value={seq.sequence_id}>
                {seq.sequence_name || seq.sequence_id}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Strg/Cmd gedrückt halten für Mehrfachauswahl
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Übergangstyp</label>
          <select
            value={sequence.transition_type}
            onChange={(e) => onUpdate({ 
              transition_type: e.target.value as LearningSequence['transition_type']
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="sequential">Sequenziell</option>
            <option value="parallel">Parallel</option>
            <option value="conditional">Bedingt</option>
            <option value="all_completed">Alle abgeschlossen</option>
            <option value="one_of">Eine von</option>
          </select>
        </div>

        {sequence.transition_type === 'conditional' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Bedingungsbeschreibung</label>
            <textarea
              value={sequence.condition_description || ''}
              onChange={(e) => onUpdate({ condition_description: e.target.value || null })}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        {sequence.next_learningsequence?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Nächste Sequenzen</label>
            <div className="mt-1 text-sm text-gray-500">
              {sequence.next_learningsequence.map(nextId => {
                const nextSeq = availableSequences.find(s => s.sequence_id === nextId);
                return nextSeq ? (nextSeq.sequence_name || nextSeq.sequence_id) : nextId;
              }).join(', ')}
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Phasen</h3>
            <button
              onClick={onAddPhase}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Phase hinzufügen
            </button>
          </div>

          <div className="space-y-4">
            {sequence.phases?.map((phase, phaseIndex) => (
              <PhaseEditor
                key={phase.phase_id}
                phase={phase}
                actors={actors}
                environments={environments}
                onUpdate={(updates) => onUpdatePhase(phaseIndex, updates)}
                onDelete={() => onDeletePhase(phaseIndex)}
                availablePhases={sequence.phases.filter((_, idx) => idx !== phaseIndex)}
                sequenceId={sequence.sequence_id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}