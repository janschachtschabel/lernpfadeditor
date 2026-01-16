import { useState } from 'react';
import { Activity, Assessment, Actor, LearningEnvironment } from '../../store/templateStore';
import { RoleEditor } from './RoleEditor';

interface ActivityEditorProps {
  activity: Activity;
  actors: Actor[];
  environments: LearningEnvironment[];
  onUpdate: (updates: Partial<Activity>) => void;
  onDelete: () => void;
  availableActivities: Activity[];
  phaseId: string;
}

const defaultAssessment: Assessment = {
  type: 'formative',
  methods: [],
  criteria: []
};

export function ActivityEditor({ 
  activity, 
  actors = [], 
  environments = [],
  onUpdate, 
  onDelete,
  availableActivities,
  phaseId
}: ActivityEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddRole = () => {
    const roleNumber = (activity.roles?.length || 0) + 1;
    const roleId = `${activity.activity_id}-R${roleNumber}`;
    
    const newRole = {
      role_id: roleId,
      role_name: '',
      actor_id: '',
      task_description: '',
      learning_environment: {
        environment_id: '',
        selected_materials: [],
        selected_tools: [],
        selected_services: []
      }
    };

    onUpdate({
      roles: [...(activity.roles || []), newRole]
    });
  };

  const handleUpdateRole = (index: number, updates: any) => {
    const newRoles = [...(activity.roles || [])];
    newRoles[index] = { ...newRoles[index], ...updates };
    onUpdate({ roles: newRoles });
  };

  const handleDeleteRole = (index: number) => {
    const newRoles = [...(activity.roles || [])];
    newRoles.splice(index, 1);
    onUpdate({ roles: newRoles });
  };

  const handleUpdateAssessment = (updates: Partial<Assessment>) => {
    onUpdate({
      assessment: {
        ...(activity.assessment || defaultAssessment),
        ...updates
      }
    });
  };

  const assessment = activity.assessment || defaultAssessment;

  // Get selected resources for display
  const getSelectedResources = () => {
    const resources: {
      materials: { name: string; env: string }[];
      tools: { name: string; env: string }[];
      services: { name: string; env: string }[];
    } = {
      materials: [],
      tools: [],
      services: []
    };

    (activity.roles || []).forEach(role => {
      const env = environments.find(e => e.id === role.learning_environment?.environment_id);
      if (env) {
        // Materials
        (role.learning_environment?.selected_materials || []).forEach(matId => {
          const material = (env.materials || []).find(m => m.id === matId);
          if (material) {
            resources.materials.push({ name: material.name, env: env.name });
          }
        });

        // Tools
        (role.learning_environment?.selected_tools || []).forEach(toolId => {
          const tool = (env.tools || []).find(t => t.id === toolId);
          if (tool) {
            resources.tools.push({ name: tool.name, env: env.name });
          }
        });

        // Services
        (role.learning_environment?.selected_services || []).forEach(serviceId => {
          const service = (env.services || []).find(s => s.id === serviceId);
          if (service) {
            resources.services.push({ name: service.name, env: env.name });
          }
        });
      }
    });

    return resources;
  };

  const selectedResources = getSelectedResources();

  return (
    <div className="border-l-2 border-yellow-500 pl-4 mb-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-lg font-semibold"
          >
            <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
            {activity.name || 'Unbenannte Aktivität'}
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
                <label className="block text-sm font-medium text-gray-700">Name der Aktivität</label>
                <input
                  type="text"
                  value={activity.name}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  placeholder="z.B. Brainstorming, Gruppenarbeit, Präsentation"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dauer (Minuten)</label>
                <input
                  type="number"
                  value={activity.duration}
                  onChange={(e) => onUpdate({ duration: parseInt(e.target.value) })}
                  placeholder="Dauer in Minuten"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
              <textarea
                value={activity.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                rows={2}
                placeholder="Beschreiben Sie die Aktivität und ihren Ablauf..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ziel</label>
              <textarea
                value={activity.goal}
                onChange={(e) => onUpdate({ goal: e.target.value })}
                rows={2}
                placeholder="z.B. Verständnis der Grundkonzepte festigen"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Voraussetzende Aktivität</label>
              <select
                value={activity.prerequisite_activity || ''}
                onChange={(e) => onUpdate({ prerequisite_activity: e.target.value || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Keine</option>
                {availableActivities.map(act => (
                  <option key={act.activity_id} value={act.activity_id}>
                    {act.name || act.activity_id}
                  </option>
                ))}
              </select>
            </div>

            {activity.next_activity?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Nächste Aktivitäten</label>
                <div className="mt-1 text-sm text-gray-500">
                  {activity.next_activity.map(nextId => {
                    const nextAct = availableActivities.find(a => a.activity_id === nextId);
                    return nextAct ? (nextAct.name || nextAct.activity_id) : nextId;
                  }).join(', ')}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Übergangstyp</label>
              <select
                value={activity.transition_type}
                onChange={(e) => onUpdate({ 
                  transition_type: e.target.value as Activity['transition_type']
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="sequential">Sequenziell</option>
                <option value="parallel">Parallel</option>
                <option value="conditional">Bedingt</option>
                <option value="branching">Verzweigung</option>
                <option value="looping">Wiederholung</option>
                <option value="optional">Optional</option>
                <option value="feedback_loops">Feedback-Schleife</option>
              </select>
            </div>

            {(activity.transition_type === 'conditional' || 
              activity.transition_type === 'branching' || 
              activity.transition_type === 'looping' || 
              activity.transition_type === 'feedback_loops') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Bedingungsbeschreibung</label>
                <textarea
                  value={activity.condition_description || ''}
                  onChange={(e) => onUpdate({ condition_description: e.target.value || null })}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={
                    activity.transition_type === 'conditional' ? 'Beschreiben Sie die Bedingung für den Übergang...' :
                    activity.transition_type === 'branching' ? 'Beschreiben Sie die Verzweigungskriterien...' :
                    activity.transition_type === 'looping' ? 'Beschreiben Sie die Wiederholungsbedingung...' :
                    'Beschreiben Sie die Feedback-Bedingung...'
                  }
                />
              </div>
            )}

            {activity.transition_type === 'looping' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Wiederholungsbedingung</label>
                <input
                  type="text"
                  value={activity.repeat_until || ''}
                  onChange={(e) => onUpdate({ repeat_until: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="z.B. Mindestens 80% korrekte Antworten"
                />
              </div>
            )}

            {activity.transition_type === 'optional' && (
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={activity.is_optional || false}
                  onChange={(e) => onUpdate({ is_optional: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Diese Aktivität ist optional
                </label>
              </div>
            )}

            {/* Selected Resources Overview */}
            <div className="border-t pt-4">
              <h4 className="text-lg font-medium mb-4">Ausgewählte Ressourcen</h4>
              
              {selectedResources.materials.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700">Lernressourcen:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                    {selectedResources.materials.map((mat, idx) => (
                      <li key={idx}>{mat.name} ({mat.env})</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedResources.tools.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700">Werkzeuge:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                    {selectedResources.tools.map((tool, idx) => (
                      <li key={idx}>{tool.name} ({tool.env})</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedResources.services.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700">Dienste:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                    {selectedResources.services.map((service, idx) => (
                      <li key={idx}>{service.name} ({service.env})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-lg font-medium mb-4">Bewertung</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Typ</label>
                  <select
                    value={assessment.type}
                    onChange={(e) => handleUpdateAssessment({ type: e.target.value as 'formative' | 'summative' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="formative">Formativ</option>
                    <option value="summative">Summativ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Methoden (kommagetrennt)</label>
                  <input
                    type="text"
                    value={assessment.methods.join(', ')}
                    onChange={(e) => handleUpdateAssessment({
                      methods: e.target.value.split(',').map(m => m.trim()).filter(Boolean)
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Kriterien (kommagetrennt)</label>
                  <input
                    type="text"
                    value={assessment.criteria.join(', ')}
                    onChange={(e) => handleUpdateAssessment({
                      criteria: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Rollen</h4>
                <button
                  onClick={handleAddRole}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Rolle hinzufügen
                </button>
              </div>

              <div className="space-y-4">
                {(activity.roles || []).map((role, index) => (
                  <RoleEditor
                    key={role.role_id}
                    role={role}
                    actors={actors}
                    environments={environments}
                    onUpdate={(updates) => handleUpdateRole(index, updates)}
                    onDelete={() => handleDeleteRole(index)}
                    activityId={activity.activity_id}
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