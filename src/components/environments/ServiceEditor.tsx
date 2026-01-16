import { useState } from 'react';
import type { Service } from '../../store/templateStore';
import { FilterEditor } from './FilterEditor';

interface ServiceEditorProps {
  service: Service;
  onUpdate: (updates: Partial<Service>) => void;
  onDelete: () => void;
  isNew?: boolean;
}

export function ServiceEditor({ service, onUpdate, onDelete, isNew = false }: ServiceEditorProps) {
  const [isEditing, setIsEditing] = useState(isNew);

  if (!isEditing) {
    return (
      <div className="border rounded-lg p-4 mb-4 bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">{service.name || 'Unbenannter Dienst'}</h4>
            <p className="text-sm text-gray-600">{service.service_type}</p>
            <p className="text-sm text-gray-500">Quelle: {service.source}</p>
            {service.access_link && (
              <p className="text-sm text-gray-500">Link: {service.access_link}</p>
            )}
            {service.source === 'database' && service.database_id && (
              <p className="text-sm text-gray-500">Datenbank-ID: {service.database_id}</p>
            )}
            {/* WLO Metadata Display */}
            {service.wlo_metadata && (
              <div className="mt-4 border-t pt-4">
                <h5 className="font-medium text-sm text-gray-700 mb-2">WLO Metadaten</h5>
                {Array.isArray(service.wlo_metadata) ? (
                  service.wlo_metadata.map((metadata, index) => (
                    <div key={index} className="mt-4 p-3 bg-gray-50 rounded-lg relative">
                      <button
                        onClick={() => {
                          const newMetadata = service.wlo_metadata.filter((_, i) => i !== index);
                          onUpdate({ 
                            wlo_metadata: newMetadata.length > 0 ? newMetadata : undefined,
                            source: newMetadata.length > 0 ? 'database' : 'filter'
                          });
                        }}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 bg-white rounded-full shadow-sm"
                        title="WLO Metadaten entfernen"
                      >
                        ×
                      </button>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Titel:</span> {metadata.title}</p>
                        {metadata.description && (
                          <p><span className="font-medium">Beschreibung:</span> {metadata.description}</p>
                        )}
                        {metadata.subject && (
                          <p><span className="font-medium">Fach:</span> {metadata.subject}</p>
                        )}
                        {metadata.educationalContext?.length > 0 && (
                          <p><span className="font-medium">Bildungskontext:</span> {metadata.educationalContext.join(', ')}</p>
                        )}
                        {metadata.wwwUrl && (
                          <p>
                            <span className="font-medium">URL:</span>{' '}
                            <a href={metadata.wwwUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {metadata.wwwUrl}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg relative">
                    <button
                      onClick={() => onUpdate({ 
                        wlo_metadata: undefined,
                        source: 'filter'
                      })}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 bg-white rounded-full shadow-sm"
                      title="WLO Metadaten entfernen"
                    >
                      ×
                    </button>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Titel:</span> {service.wlo_metadata.title}</p>
                      {service.wlo_metadata.description && (
                        <p><span className="font-medium">Beschreibung:</span> {service.wlo_metadata.description}</p>
                      )}
                      {service.wlo_metadata.subject && (
                        <p><span className="font-medium">Fach:</span> {service.wlo_metadata.subject}</p>
                      )}
                      {service.wlo_metadata.educationalContext?.length > 0 && (
                        <p><span className="font-medium">Bildungskontext:</span> {service.wlo_metadata.educationalContext.join(', ')}</p>
                      )}
                      {service.wlo_metadata.wwwUrl && (
                        <p>
                          <span className="font-medium">URL:</span>{' '}
                          <a href={service.wlo_metadata.wwwUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {service.wlo_metadata.wwwUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm bg-blue-100 rounded hover:bg-blue-200"
            >
              Bearbeiten
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-100 rounded hover:bg-red-200"
            >
              Löschen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={service.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="z.B. Sprachunterstützung, Online-Lernplattform"
          className="w-full p-2 border rounded"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Typ</label>
        <input
          type="text"
          value={service.service_type}
          onChange={(e) => onUpdate({ service_type: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="z.B. Förderung, Beratung, Cloud-Dienst" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Zugangslink</label>
        <input
          type="text"
          value={service.access_link}
          onChange={(e) => onUpdate({ access_link: e.target.value })}
          placeholder="z.B. https://example.com/service"
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Quelle</label>
        <select
          value={service.source}
          onChange={(e) => onUpdate({ source: e.target.value as Service['source'] })}
          className="w-full p-2 border rounded"
        >
          <option value="manual">Manuell</option>
          <option value="database">Datenbank</option>
          <option value="filter">Filter</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Datenbank-ID</label>
        <input
          type="text"
          value={service.database_id || ''}
          onChange={(e) => onUpdate({ database_id: e.target.value })}
          className="w-full p-2 border rounded"
          disabled={service.source !== 'database'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Filterkriterien</label>
        <FilterEditor
          filter={service.filter_criteria || {}}
          onChange={(filter) => onUpdate({ filter_criteria: filter })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => {
            if (isNew) {
              onDelete();
            } else {
              setIsEditing(false);
            }
          }}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Abbrechen
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Speichern
        </button>
      </div>
    </div>
  );
}