import { useState } from 'react';
import { Role, Actor, LearningEnvironment } from '../../store/templateStore';

interface RoleEditorProps {
  role: Role;
  actors: Actor[];
  environments: LearningEnvironment[];
  onUpdate: (updates: Partial<Role>) => void;
  onDelete: () => void;
  activityId: string;
}

export function RoleEditor({
  role,
  actors,
  environments,
  onUpdate,
  onDelete,
  activityId
}: RoleEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const selectedEnvironment = environments.find(
    env => env.id === role.learning_environment?.environment_id
  );

  const handleEnvironmentChange = (environmentId: string) => {
    onUpdate({
      learning_environment: {
        environment_id: environmentId,
        selected_materials: [],
        selected_tools: [],
        selected_services: []
      }
    });
  };

  const handleResourceSelection = (
    type: 'materials' | 'tools' | 'services',
    selectedIds: string[]
  ) => {
    if (!role.learning_environment) return;

    onUpdate({
      learning_environment: {
        ...role.learning_environment,
        [`selected_${type}`]: selectedIds
      }
    });
  };

  return (
    <div className="border-l-2 border-orange-500 pl-4 mb-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-lg font-semibold"
          >
            <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
            {role.role_name || 'Unnamed Role'}
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role Name</label>
              <input
                type="text"
                value={role.role_name}
                onChange={(e) => onUpdate({ role_name: e.target.value })}
                placeholder="z.B. Moderator, Gruppenleiter, Beobachter"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Actor</label>
              <select
                value={role.actor_id}
                onChange={(e) => onUpdate({ actor_id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an actor...</option>
                {actors.map(actor => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name} ({actor.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Task Description</label>
              <textarea
                value={role.task_description}
                onChange={(e) => onUpdate({ task_description: e.target.value })}
                rows={3}
                placeholder="Beschreiben Sie die Aufgaben und Verantwortlichkeiten dieser Rolle..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Binnendifferenzierung */}
            {(() => {
              const selectedActor = actors.find(a => a.id === role.actor_id);
              const diffOptions = selectedActor?.differentiation_options || [];
              if (diffOptions.length === 0) return null;
              
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Binnendifferenzierung
                  </label>
                  <div className="border rounded-md p-2 bg-indigo-50/50 space-y-2">
                    {diffOptions.map(option => (
                      <label key={option.id} className="flex items-start p-2 hover:bg-indigo-100/50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={role.selected_differentiation?.includes(option.id) || false}
                          onChange={(e) => {
                            const currentSelection = role.selected_differentiation || [];
                            const newSelection = e.target.checked
                              ? [...currentSelection, option.id]
                              : currentSelection.filter(id => id !== option.id);
                            onUpdate({ selected_differentiation: newSelection });
                          }}
                          className="mt-1 mr-3 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-indigo-900">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-indigo-700">{option.description}</div>
                          )}
                          {(option.hints || []).length > 0 && (
                            <div className="mt-1 text-xs text-gray-600">
                              {(option.hints || []).map((hint, i) => (
                                <div key={i} className="flex items-start gap-1">
                                  <span className="text-indigo-500">•</span>
                                  <span>{hint}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Wählen Sie relevante Differenzierungsoptionen für diese Rolle
                  </p>
                </div>
              );
            })()}

            <div>
              <label className="block text-sm font-medium text-gray-700">Learning Environment</label>
              <select
                value={role.learning_environment?.environment_id || ''}
                onChange={(e) => handleEnvironmentChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an environment...</option>
                {environments.map(env => (
                  <option key={env.id} value={env.id}>{env.name}</option>
                ))}
              </select>
            </div>

            {selectedEnvironment && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materials (hold Ctrl/Cmd to select multiple)
                  </label>
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                    {selectedEnvironment.materials.map(material => (
                      <label key={material.id} className="flex items-center p-1 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={role.learning_environment?.selected_materials?.includes(material.id) || false}
                          onChange={(e) => {
                            const currentSelection = role.learning_environment?.selected_materials || [];
                            const newSelection = e.target.checked
                              ? [...currentSelection, material.id]
                              : currentSelection.filter(id => id !== material.id);
                            handleResourceSelection('materials', newSelection);
                          }}
                          className="mr-2"
                        />
                        {material.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tools (hold Ctrl/Cmd to select multiple)
                  </label>
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                    {selectedEnvironment.tools.map(tool => (
                      <label key={tool.id} className="flex items-center p-1 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={role.learning_environment?.selected_tools?.includes(tool.id) || false}
                          onChange={(e) => {
                            const currentSelection = role.learning_environment?.selected_tools || [];
                            const newSelection = e.target.checked
                              ? [...currentSelection, tool.id]
                              : currentSelection.filter(id => id !== tool.id);
                            handleResourceSelection('tools', newSelection);
                          }}
                          className="mr-2"
                        />
                        {tool.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services (hold Ctrl/Cmd to select multiple)
                  </label>
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                    {selectedEnvironment.services.map(service => (
                      <label key={service.id} className="flex items-center p-1 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={role.learning_environment?.selected_services?.includes(service.id) || false}
                          onChange={(e) => {
                            const currentSelection = role.learning_environment?.selected_services || [];
                            const newSelection = e.target.checked
                              ? [...currentSelection, service.id]
                              : currentSelection.filter(id => id !== service.id);
                            handleResourceSelection('services', newSelection);
                          }}
                          className="mr-2"
                        />
                        {service.name}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}