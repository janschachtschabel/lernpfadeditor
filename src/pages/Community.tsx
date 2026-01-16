import { useState, useEffect } from 'react';
import { useTemplateStore } from '../store/templateStore';
import { SaveLoad } from '../components/SaveLoad';
import { FACH_MAPPING } from '../lib/mappings';

interface CommunityTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
  date: string;
  template: any;
}

export function Community() {
  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<CommunityTemplate[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const state = useTemplateStore();

  // Filter templates when selection changes
  useEffect(() => {
    if (selectedSubject) {
      setFilteredTemplates(templates.filter(template => 
        template.template.context?.subject?.toLowerCase() === selectedSubject.toLowerCase()
      ));
    } else {
      setFilteredTemplates(templates);
    }
  }, [selectedSubject, templates]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/community-templates/index.json');
      if (!response.ok) throw new Error('Failed to load templates');
      const index = await response.json();
      
      const loadedTemplates = await Promise.all(
        index.templates.map(async (templateInfo: any) => {
          const templateResponse = await fetch(`/community-templates/${templateInfo.file}`);
          if (!templateResponse.ok) throw new Error(`Failed to load template ${templateInfo.name}`);
          const template = await templateResponse.json();
          return {
            ...templateInfo,
            template
          };
        })
      );
      
      setTemplates(loadedTemplates);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      setLoading(false);
    }
  };

  const handleLoadTemplate = async (template: CommunityTemplate) => {
    if (confirm('Möchten Sie dieses Template laden? Aktuelle Änderungen gehen verloren.')) {
      const { template: templateData } = template;
      
      state.setMetadata(templateData.metadata);
      state.setProblem(templateData.problem);
      state.setContext(templateData.context);
      state.setInfluenceFactors(templateData.influence_factors);
      state.setSolution(templateData.solution);
      state.setConsequences(templateData.consequences);
      state.setImplementationNotes(templateData.implementation_notes);
      state.setRelatedPatterns(templateData.related_patterns);
      state.setFeedback(templateData.feedback);
      state.setSources(templateData.sources);
      state.setActors(templateData.actors);
      state.setEnvironments(templateData.environments);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <div className="text-lg text-gray-600">Lade Community Templates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Community Templates</h1> 
        </div>
        <SaveLoad />
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-purple-900 mb-2">So funktioniert's:</h2>
        <ul className="space-y-2 text-purple-800">
          <li className="flex items-center gap-2">
            <span className="text-purple-500">1.</span>
            Durchsuchen Sie die verfügbaren Templates nach Themen und Fächern
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-500">2.</span>
            Klicken Sie auf "Template laden" um es in den Editor zu übernehmen
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-500">3.</span>
            Passen Sie das geladene Template an Ihre Bedürfnisse an
          </li>
        </ul>
      </div>
      
      <div className="mb-6 flex items-center gap-4">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        >
          <option value="">Alle Fächer</option>
          {Object.keys(FACH_MAPPING).map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        
        <div className="text-sm text-gray-500">
          {selectedSubject ? (
            `${filteredTemplates.length} Template${filteredTemplates.length === 1 ? '' : 's'} für ${selectedSubject}`
          ) : (
            `${templates.length} Template${templates.length === 1 ? '' : 's'} insgesamt`
          )}
        </div>
      </div>

      {templates.length === 0 && !error && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Keine Templates verfügbar</h3>
          <p className="text-yellow-700">
            Aktuell sind keine Community-Templates im System hinterlegt.
            Bitte versuchen Sie es später erneut oder nutzen Sie das Beispiel-Template.
          </p>
      </div>
      )}

      <div className="grid gap-6">
        {filteredTemplates.map((template) => (
          <div 
            key={template.id}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Von {template.author} • {new Date(template.date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleLoadTemplate(template)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                Template laden
              </button>
            </div>
            <p className="mt-4 text-gray-600">{template.description}</p>
            {template.template.metadata?.keywords?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {template.template.metadata.keywords.map((keyword: string, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}