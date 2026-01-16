import React from 'react';
import { ResourceCard } from './components/ResourceCard';

interface ResourceGridProps {
  resources: any[];
  title: string;
}

export function ResourceGrid({ resources, title }: ResourceGridProps) {
  if (resources.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      <div className="grid grid-cols-4 gap-4">
        {resources.map((resource, index) => (
          <div 
            key={`${resource.id}-${index}`}
            className="w-full"
            style={{ minWidth: '250px', maxWidth: '300px' }}
          >
            <ResourceCard resource={resource} />
          </div>
        ))}
      </div>
    </div>
  );
}