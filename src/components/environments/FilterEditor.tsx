import { useState } from 'react';
import type { FilterCriteria } from '../../store/templateStore';

interface FilterEditorProps {
  filter: FilterCriteria;
  onChange: (filter: FilterCriteria) => void;
}

export function FilterEditor({ filter, onChange }: FilterEditorProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddCriteria = () => {
    if (newKey && newValue) {
      onChange({
        ...filter,
        [newKey]: newValue
      });
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemoveCriteria = (key: string) => {
    const { [key]: _, ...rest } = filter;
    onChange(rest);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Eigenschaft"
          className="p-2 border rounded"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Wert"
          className="p-2 border rounded"
        />
      </div>
      
      <button
        onClick={handleAddCriteria}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Kriterium hinzufügen
      </button>

      <div className="space-y-2">
        {Object.entries(filter).map(([key]) => (
          <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <span className="font-medium">{key}:</span> {filter[key]}
            </div>
            <button
              onClick={() => handleRemoveCriteria(key)}
              className="text-red-500 hover:text-red-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}