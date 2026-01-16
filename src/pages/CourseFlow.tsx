import { useTemplateStore } from '../store/templateStore';
import { SequenceEditor } from '../components/course/SequenceEditor';
import type { LearningSequence, Phase } from '../store/templateStore';
import { SaveLoad } from '../components/SaveLoad';
import { AcademicCapIcon, PlusIcon, ListBulletIcon, ClockIcon, PlayIcon } from '@heroicons/react/24/outline';

export function CourseFlow() {
  const { 
    solution, 
    setSolution,
    actors,
    environments
  } = useTemplateStore();

  const handleAddSequence = () => {
    const sequences = solution.didactic_template.learning_sequences || [];
    const sequenceNumber = sequences.length + 1;
    const sequenceId = `LS${sequenceNumber}`;

    const newSequence: LearningSequence = {
      sequence_id: sequenceId,
      sequence_name: '',
      time_frame: '',
      learning_goal: '',
      phases: [],
      prerequisite_learningsequences: [],
      transition_type: 'sequential',
      condition_description: null,
      next_learningsequence: []
    };

    setSolution({
      ...solution,
      didactic_template: {
        ...solution.didactic_template,
        learning_sequences: [...sequences, newSequence]
      }
    });
  };

  const handleUpdateSequence = (index: number, updates: Partial<LearningSequence>) => {
    const newSolution = { ...solution };
    const sequences = newSolution.didactic_template.learning_sequences;
    const sequence = sequences[index];

    // If prerequisite sequences are being updated
    if ('prerequisite_learningsequences' in updates) {
      const oldPrereqs = sequence.prerequisite_learningsequences;
      const newPrereqs = updates.prerequisite_learningsequences || [];

      // Remove this sequence from old prerequisites' next list
      oldPrereqs.forEach(prereqId => {
        const oldPrereqSeq = sequences.find(s => s.sequence_id === prereqId);
        if (oldPrereqSeq) {
          oldPrereqSeq.next_learningsequence = oldPrereqSeq.next_learningsequence.filter(
            id => id !== sequence.sequence_id
          );
        }
      });

      // Add this sequence to new prerequisites' next list
      newPrereqs.forEach(prereqId => {
        const newPrereqSeq = sequences.find(s => s.sequence_id === prereqId);
        if (newPrereqSeq && !newPrereqSeq.next_learningsequence.includes(sequence.sequence_id)) {
          newPrereqSeq.next_learningsequence.push(sequence.sequence_id);
        }
      });
    }

    Object.assign(sequence, updates);
    setSolution(newSolution);
  };

  const handleAddPhase = (sequenceIndex: number) => {
    const newSolution = { ...solution };
    const sequence = newSolution.didactic_template.learning_sequences[sequenceIndex];
    const phaseNumber = sequence.phases.length + 1;
    const phaseId = `${sequence.sequence_id}-P${phaseNumber}`;

    const newPhase: Phase = {
      phase_id: phaseId,
      phase_name: '',
      time_frame: '',
      learning_goal: '',
      activities: [],
      prerequisite_phase: null,
      transition_type: 'sequential',
      condition_description: null,
      next_phase: null
    };
    sequence.phases = [...sequence.phases, newPhase];
    setSolution(newSolution);
  };

  const handleUpdatePhase = (sequenceIndex: number, phaseIndex: number, updates: Partial<Phase>) => {
    const newSolution = { ...solution };
    const sequence = newSolution.didactic_template.learning_sequences[sequenceIndex];
    const phases = sequence.phases;
    const phase = phases[phaseIndex];

    // If prerequisite phase is being updated
    if ('prerequisite_phase' in updates) {
      const oldPrereq = phase.prerequisite_phase;
      const newPrereq = updates.prerequisite_phase;

      // Remove this phase from old prerequisite's next phase
      if (oldPrereq) {
        const oldPrereqPhase = phases.find(p => p.phase_id === oldPrereq);
        if (oldPrereqPhase) {
          oldPrereqPhase.next_phase = null;
        }
      }

      // Set this phase as next phase for new prerequisite
      if (newPrereq) {
        const newPrereqPhase = phases.find(p => p.phase_id === newPrereq);
        if (newPrereqPhase) {
          newPrereqPhase.next_phase = phase.phase_id;
        }
      }
    }

    Object.assign(phase, updates);
    setSolution(newSolution);
  };

  const handleDeletePhase = (sequenceIndex: number, phaseIndex: number) => {
    const newSolution = { ...solution };
    const sequence = newSolution.didactic_template.learning_sequences[sequenceIndex];
    const phase = sequence.phases[phaseIndex];

    // Update relationships when deleting a phase
    if (phase.prerequisite_phase) {
      const prereqPhase = sequence.phases.find(p => p.phase_id === phase.prerequisite_phase);
      if (prereqPhase) {
        prereqPhase.next_phase = phase.next_phase;
      }
    }

    sequence.phases.splice(phaseIndex, 1);
    setSolution(newSolution);
  };

  const sequenceCount = solution.didactic_template?.learning_sequences?.length || 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center">
            <span className="text-white font-bold">6</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Unterrichtsablauf</h1>
            <p className="text-sm text-gray-500">Sequenzen, Phasen und Aktivitäten</p>
          </div>
        </div>
        <SaveLoad />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
          <div className="flex items-center gap-3">
            <ListBulletIcon className="w-8 h-8 text-pink-500" />
            <div>
              <div className="text-2xl font-bold text-pink-900">{sequenceCount}</div>
              <div className="text-xs text-pink-700">Lernsequenzen</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-8 h-8 text-violet-500" />
            <div>
              <div className="text-2xl font-bold text-violet-900">
                {solution.didactic_template?.learning_sequences?.reduce((sum, s) => sum + s.phases.length, 0) || 0}
              </div>
              <div className="text-xs text-violet-700">Phasen</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <PlayIcon className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {solution.didactic_template?.learning_sequences?.reduce((sum, s) => 
                  sum + s.phases.reduce((pSum, p) => pSum + p.activities.length, 0), 0) || 0}
              </div>
              <div className="text-xs text-blue-700">Aktivitäten</div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section - Collapsible */}
      <details className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
          <AcademicCapIcon className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Hilfe: So strukturieren Sie Ihren Unterrichtsablauf</span>
        </summary>
        <div className="px-6 pb-6 pt-2 grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Hierarchie</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-bold">1</span>
                <div><strong>Sequenzen</strong> - Übergeordnete Einheiten (z.B. eine Unterrichtseinheit)</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">2</span>
                <div><strong>Phasen</strong> - Abschnitte innerhalb einer Sequenz</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
                <div><strong>Aktivitäten</strong> - Konkrete Lernhandlungen mit Rollen</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Ablauftypen</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="px-2 py-1 bg-gray-100 rounded">Sequenziell</div>
              <div className="px-2 py-1 bg-gray-100 rounded">Parallel</div>
              <div className="px-2 py-1 bg-gray-100 rounded">Bedingt</div>
              <div className="px-2 py-1 bg-gray-100 rounded">Verzweigung</div>
              <div className="px-2 py-1 bg-gray-100 rounded">Wiederholung</div>
              <div className="px-2 py-1 bg-gray-100 rounded">Feedback-Schleife</div>
            </div>
          </div>
        </div>
      </details>

      {/* Sequences List */}
      {sequenceCount === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <AcademicCapIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Noch keine Lernsequenzen definiert</p>
          <button
            onClick={handleAddSequence}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Erste Lernsequenz erstellen
          </button>
        </div>
      ) : (
        <>
      <div className="space-y-6">
        {solution.didactic_template?.learning_sequences?.map((sequence, sequenceIndex) => (
          <SequenceEditor
            key={sequence.sequence_id}
            sequence={sequence}
            sequenceIndex={sequenceIndex}
            availableSequences={solution.didactic_template.learning_sequences.filter((_, idx) => idx !== sequenceIndex)}
            actors={actors}
            environments={environments}
            onUpdate={(updates) => handleUpdateSequence(sequenceIndex, updates)}
            onAddPhase={() => handleAddPhase(sequenceIndex)}
            onUpdatePhase={(phaseIndex, updates) => handleUpdatePhase(sequenceIndex, phaseIndex, updates)}
            onDeletePhase={(phaseIndex) => handleDeletePhase(sequenceIndex, phaseIndex)}
          />
        ))}
      </div>

      <button
        onClick={handleAddSequence}
        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-all flex items-center justify-center gap-2"
      >
        <PlusIcon className="w-5 h-5" />
        Weitere Lernsequenz hinzufügen
      </button>
        </>
      )}
    </div>
  );
}