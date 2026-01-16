import { useTemplateStore } from '../store/templateStore';
import type { Material, Tool, Service } from '../store/templateStore';
import { MaterialEditor } from '../components/environments/MaterialEditor';
import { ToolEditor } from '../components/environments/ToolEditor';
import { ServiceEditor } from '../components/environments/ServiceEditor';
import { SaveLoad } from '../components/SaveLoad';
import { INHALTSTYP_MAPPING } from '../lib/mappings';
import { BuildingLibraryIcon, PlusIcon, TrashIcon, BookOpenIcon, WrenchScrewdriverIcon, CloudIcon } from '@heroicons/react/24/outline';

const defaultEnvironment = {
  id: '',
  name: '',
  description: '',
  materials: [],
  tools: [],
  services: []
};

export function LearningEnvironments() {
  const { environments = [], addEnvironment, updateEnvironment, removeEnvironment } = useTemplateStore();

  // Get the list of content types from the mapping
  const contentTypes = Object.keys(INHALTSTYP_MAPPING);

  const handleAddEnvironment = () => {
    const envNumber = environments.length + 1;
    const envId = `ENV${envNumber}`;
    
    addEnvironment({
      ...defaultEnvironment,
      id: envId
    });
  };

  const handleAddMaterial = (envId: string) => {
    const env = environments.find(e => e.id === envId);
    if (env) {
      const materialNumber = (env.materials || []).length + 1;
      const materialId = `${envId}-M${materialNumber}`;
      
      const newMaterial: Material = {
        id: materialId,
        name: '',
        material_type: '',
        source: 'manual',
        access_link: ''
      };
      updateEnvironment(envId, {
        materials: [...(env.materials || []), newMaterial]
      });
    }
  };

  const handleAddTool = (envId: string) => {
    const env = environments.find(e => e.id === envId);
    if (env) {
      const toolNumber = (env.tools || []).length + 1;
      const toolId = `${envId}-T${toolNumber}`;
      
      const newTool: Tool = {
        id: toolId,
        name: '',
        tool_type: '',
        source: 'manual',
        access_link: ''
      };
      updateEnvironment(envId, {
        tools: [...(env.tools || []), newTool]
      });
    }
  };

  const handleAddService = (envId: string) => {
    const env = environments.find(e => e.id === envId);
    if (env) {
      const serviceNumber = (env.services || []).length + 1;
      const serviceId = `${envId}-S${serviceNumber}`;
      
      const newService: Service = {
        id: serviceId,
        name: '',
        service_type: '',
        source: 'manual',
        access_link: ''
      };
      updateEnvironment(envId, {
        services: [...(env.services || []), newService]
      });
    }
  };

  const handleUpdateMaterial = (envId: string, materialId: string, updates: Partial<Material>) => {
    const env = environments.find(e => e.id === envId);
    if (env) {
      const updatedMaterials = (env.materials || []).map(material =>
        material.id === materialId ? { ...material, ...updates } : material
      );
      updateEnvironment(envId, { materials: updatedMaterials });
    }
  };

  const handleUpdateTool = (envId: string, toolId: string, updates: Partial<Tool>) => {
    const env = environments.find(e => e.id === envId);
    if (env) {
      const updatedTools = (env.tools || []).map(tool =>
        tool.id === toolId ? { ...tool, ...updates } : tool
      );
      updateEnvironment(envId, { tools: updatedTools });
    }
  };

  const handleUpdateService = (envId: string, serviceId: string, updates: Partial<Service>) => {
    const env = environments.find(e => e.id === envId);
    if (env) {
      const updatedServices = (env.services || []).map(service =>
        service.id === serviceId ? { ...service, ...updates } : service
      );
      updateEnvironment(envId, { services: updatedServices });
    }
  };

  const handleRemoveMaterial = (envId: string, materialId: string) => {
    const env = environments.find(e => e.id === envId);
    if (env) {
      updateEnvironment(envId, {
        materials: (env.materials || []).filter(m => m.id !== materialId)
      });
    }
  };

  const handleRemoveTool = (envId: string, toolId: string) => {
    const env = environments.find(e => e.id === envId);
    if (env) {
      updateEnvironment(envId, {
        tools: (env.tools || []).filter(t => t.id !== toolId)
      });
    }
  };

  const handleRemoveService = (envId: string, serviceId: string) => {
    const env = environments.find(e => e.id === envId);
    if (env) {
      updateEnvironment(envId, {
        services: (env.services || []).filter(s => s.id !== serviceId)
      });
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
            <span className="text-white font-bold">4</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lernumgebungen</h1>
            <p className="text-sm text-gray-500">Ressourcen, Werkzeuge und Dienste</p>
          </div>
        </div>
        <SaveLoad />
      </div>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <BookOpenIcon className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-medium text-blue-900">Lernressourcen</h3>
          <p className="text-xs text-blue-700 mt-1">Arbeitsblätter, Videos, Übungen</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <WrenchScrewdriverIcon className="w-6 h-6 text-amber-600 mb-2" />
          <h3 className="font-medium text-amber-900">Werkzeuge</h3>
          <p className="text-xs text-amber-700 mt-1">Hardware, Software, Geräte</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
          <CloudIcon className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="font-medium text-emerald-900">Dienste</h3>
          <p className="text-xs text-emerald-700 mt-1">Online-Plattformen, Services</p>
        </div>
      </div>

      {/* Environments List */}
      {environments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <BuildingLibraryIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Noch keine Lernumgebungen definiert</p>
          <button
            onClick={handleAddEnvironment}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Erste Lernumgebung erstellen
          </button>
        </div>
      ) : (
        <>
      {environments.map((env) => (
        <div key={env.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <BuildingLibraryIcon className="w-5 h-5 text-purple-600" />
                <input
                  type="text"
                  value={env.name}
                  onChange={(e) => updateEnvironment(env.id, { name: e.target.value })}
                  placeholder="Name der Lernumgebung..."
                  className="text-lg font-semibold bg-transparent border-none focus:ring-0 p-0 text-gray-900 placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => removeEnvironment(env.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
              <textarea
                value={env.description}
                onChange={(e) => updateEnvironment(env.id, { description: e.target.value })}
                rows={2}
                placeholder="Beschreiben Sie die Lernumgebung..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              />
            </div>

          <div className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Lernressourcen</h3>
              <button
                onClick={() => handleAddMaterial(env.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Lernressource hinzufügen
              </button>
            </div>
            {(env.materials || []).map((material) => (
              <MaterialEditor
                key={material.id}
                material={material}
                onUpdate={(updates) => handleUpdateMaterial(env.id, material.id, updates)}
                onDelete={() => handleRemoveMaterial(env.id, material.id)}
                isNew={material.name === ''}
                contentTypes={contentTypes}
              />
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Werkzeuge</h3>
              <button
                onClick={() => handleAddTool(env.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Werkzeug hinzufügen
              </button>
            </div>
            {(env.tools || []).map((tool) => (
              <ToolEditor
                key={tool.id}
                tool={tool}
                onUpdate={(updates) => handleUpdateTool(env.id, tool.id, updates)}
                onDelete={() => handleRemoveTool(env.id, tool.id)}
                isNew={tool.name === ''}
              />
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Dienste</h3>
              <button
                onClick={() => handleAddService(env.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Dienst hinzufügen
              </button>
            </div>
            {(env.services || []).map((service) => (
              <ServiceEditor
                key={service.id}
                service={service}
                onUpdate={(updates) => handleUpdateService(env.id, service.id, updates)}
                onDelete={() => handleRemoveService(env.id, service.id)}
                isNew={service.name === ''}
              />
            ))}
          </div>
          </div>
        </div>
      ))}

      {/* Add Environment Button */}
      <button
        onClick={handleAddEnvironment}
        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
      >
        <PlusIcon className="w-5 h-5" />
        Weitere Lernumgebung hinzufügen
      </button>
        </>
      )}
    </div>
  );
}