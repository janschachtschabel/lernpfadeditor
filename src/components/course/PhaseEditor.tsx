import { useState } from 'react';
import { Phase, Actor, LearningEnvironment } from '../../store/templateStore';
import { ActivityEditor } from './ActivityEditor';

interface PhaseEditorProps {
  phase: Phase;
  actors: Actor[];
  environments: LearningEnvironment[];
  availablePhases: Phase[];
  onUpdate: (updates: Partial<Phase>) => void;
  onDelete: () => void;
  sequenceId: string;
}

export function PhaseEditor({
  phase,
  actors,
  environments,
  availablePhases,
  onUpdate,
  onDelete,
  sequenceId
}: PhaseEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddActivity = () => {
    const activityNumber = (phase.activities?.length || 0) + 1;
    const activityId = `${phase.phase_id}-A${activityNumber}`;

    const newActivity = {
      activity_id: activityId,
      name: '',
      description: '',
      duration: 0,
      roles: [],
      goal: '',
      prerequisite_activity: null,
      transition_type: 'sequential',
      condition_description: null,
      next_activity: [],
      assessment: {
        type: 'formative',
        methods: [],
        criteria: []
      }
    };

    onUpdate({
      activities: [...(phase.activities || []), newActivity]
    });
  };

  const handleUpdateActivity = (index: number, updates: any) => {
    const newActivities = [...(phase.activities || [])];
    const activity = newActivities[index];

    // If prerequisite activity is being updated
    if ('prerequisite_activity' in updates) {
      const oldPrereq = activity.prerequisite_activity;
      const newPrereq = updates.prerequisite_activity;

      // Remove this activity from old prerequisite's next list
      if (oldPrereq) {
        const oldPrereqAct = newActivities.find(a => a.activity_id === oldPrereq);
        if (oldPrereqAct) {
          oldPrereqAct.next_activity = oldPrereqAct.next_activity.filter(
            id => id !== activity.activity_id
          );
        }
      }

      // Add this activity to new prerequisite's next list
      if (newPrereq) {
        const newPrereqAct = newActivities.find(a => a.activity_id === newPrereq);
        if (newPrereqAct && !newPrereqAct.next_activity.includes(activity.activity_id)) {
          newPrereqAct.next_activity.push(activity.activity_id);
        }
      }
    }

    Object.assign(activity, updates);
    onUpdate({ activities: newActivities });
  };

  const handleDeleteActivity = (index: number) => {
    const newActivities = [...(phase.activities || [])];
    const activity = newActivities[index];

    // Update relationships when deleting an activity
    if (activity.prerequisite_activity) {
      const prereqAct = newActivities.find(a => a.activity_id === activity.prerequisite_activity);
      if (prereqAct) {
        prereqAct.next_activity = prereqAct.next_activity.filter(id => id !== activity.activity_id);
      }
    }

    newActivities.splice(index, 1);
    onUpdate({ activities: newActivities });
  };

  return (
    <div className="border-l-2 border-blue-500 pl-4 mb-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-lg font-semibold"
          >
            <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
            {phase.phase_name || 'Unbenannte Phase'}
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            Entfernen
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name der Phase</label>
                <input
                  type="text"
                  value={phase.phase_name}
                  onChange={(e) => onUpdate({ phase_name: e.target.value })}
                  placeholder="z.B. Aktivierung, Erarbeitung, Sicherung"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Zeitrahmen</label>
                <input
                  type="text"
                  value={phase.time_frame}
                  onChange={(e) => onUpdate({ time_frame: e.target.value })}
                  placeholder="z.B. 15 Minuten"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lernziel</label>
              <textarea
                value={phase.learning_goal}
                onChange={(e) => onUpdate({ learning_goal: e.target.value })}
                rows={2}
                placeholder="z.B. Vorwissen aktivieren und Interesse wecken"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Voraussetzende Phase</label>
              <select
                value={phase.prerequisite_phase || ''}
                onChange={(e) => onUpdate({ prerequisite_phase: e.target.value || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Keine</option>
                {availablePhases.map(p => (
                  <option key={p.phase_id} value={p.phase_id}>
                    {p.phase_name || p.phase_id}
                  </option>
                ))}
              </select>
            </div>

            {phase.next_phase && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Nächste Phase</label>
                <div className="mt-1 text-sm text-gray-500">
                  {availablePhases.find(p => p.phase_id === phase.next_phase)?.phase_name || phase.next_phase}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Aktivitäten</h4>
                <button
                  onClick={handleAddActivity}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Aktivität hinzufügen
                </button>
              </div>

              <div className="space-y-4">
                {phase.activities?.map((activity, index) => (
                  <ActivityEditor
                    key={activity.activity_id}
                    activity={activity}
                    actors={actors}
                    environments={environments}
                    availableActivities={phase.activities.filter((_, idx) => idx !== index)}
                    onUpdate={(updates) => handleUpdateActivity(index, updates)}
                    onDelete={() => handleDeleteActivity(index)}
                    phaseId={phase.phase_id}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}