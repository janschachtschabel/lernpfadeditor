import React from 'react';

interface ResourceMetaProps {
  subject?: string;
  contexts?: string[];
}

export function ResourceMeta({ subject, contexts }: ResourceMetaProps) {
  return (
    <div className="flex flex-wrap gap-1 mt-auto">
      {subject && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {subject}
        </span>
      )}
      {contexts?.map((context, idx) => (
        <span 
          key={idx}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
        >
          {context}
        </span>
      ))}
    </div>
  );
}