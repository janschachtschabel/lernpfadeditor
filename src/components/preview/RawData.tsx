import React from 'react';
import { useTemplateStore } from '../../store/templateStore';
import { Editor } from '../Editor';

export function RawData() {
  const state = useTemplateStore();
  
  const currentTemplate = {
    metadata: state.metadata,
    problem: state.problem,
    context: state.context,
    influence_factors: state.influence_factors,
    solution: state.solution,
    consequences: state.consequences,
    implementation_notes: state.implementation_notes,
    related_patterns: state.related_patterns,
    feedback: state.feedback,
    sources: state.sources,
    actors: state.actors,
    environments: state.environments
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-[500px] border rounded-lg overflow-hidden">
        <Editor
          value={JSON.stringify(currentTemplate, null, 2)}
          onChange={() => {}}
          readOnly={true}
        />
      </div>
    </div>
  );
}