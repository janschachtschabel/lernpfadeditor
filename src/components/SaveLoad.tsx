import { useState } from 'react';
import { useTemplateStore } from '../store/templateStore';
import { DocumentArrowDownIcon, DocumentArrowUpIcon, DocumentPlusIcon, TrashIcon, DocumentTextIcon, UsersIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { generatePDF } from '../lib/pdfGenerator';
import { exportToMarkdown, exportToHTML, downloadFile } from '../lib/exportFormats';
import { downloadMoodleXML, downloadIMSCC } from '../lib/lmsExport';

export function SaveLoad() {
  const state = useTemplateStore();

  const handleSave = () => {
    const template = {
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

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.metadata.title || 'template'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const template = JSON.parse(content);
        
        if (template.metadata) state.setMetadata(template.metadata);
        if (template.problem) state.setProblem(template.problem);
        if (template.context) state.setContext(template.context);
        if (template.influence_factors) state.setInfluenceFactors(template.influence_factors);
        if (template.solution) state.setSolution(template.solution);
        if (template.consequences) state.setConsequences(template.consequences);
        if (template.implementation_notes) state.setImplementationNotes(template.implementation_notes);
        if (template.related_patterns) state.setRelatedPatterns(template.related_patterns);
        if (template.feedback) state.setFeedback(template.feedback);
        if (template.sources) state.setSources(template.sources);
        if (template.actors) state.setActors(template.actors);
        if (template.environments) state.setEnvironments(template.environments);
      } catch (error) {
        console.error('Error loading template:', error);
        alert('Fehler beim Laden der Vorlage');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadExample = async () => {
    if (!confirm('Möchten Sie das Beispiel-Template laden? Aktuelle Änderungen gehen verloren.')) {
      return;
    }

    try {
      const response = await fetch('/community-templates/Einfuehrung-Addition-Klasse3.json?v=' + Date.now());
      if (response.ok) {
        const template = await response.json();
        state.setMetadata(template.metadata || {});
        state.setProblem(template.problem || {});
        state.setContext(template.context || {});
        state.setInfluenceFactors(template.influence_factors || []);
        state.setSolution(template.solution || {});
        state.setConsequences(template.consequences || {});
        state.setImplementationNotes(template.implementation_notes || []);
        state.setRelatedPatterns(template.related_patterns || []);
        state.setFeedback(template.feedback || {});
        state.setSources(template.sources || []);
        state.setActors(template.actors || []);
        state.setEnvironments(template.environments || []);
      }
    } catch (e) {
      console.error('Fehler beim Laden des Beispiel-Templates:', e);
    }
  };

  const handleClear = () => {
    if (!confirm('Möchten Sie wirklich alle Daten löschen?')) {
      return;
    }
    
    state.setMetadata({ title: '', description: '', keywords: [], author: '', version: '1.0' });
    state.setProblem({ problem_description: '', learning_goals: [], didactic_keywords: [] });
    state.setContext({ target_group: '', subject: '', educational_level: '', prerequisites: '', time_frame: '' });
    state.setInfluenceFactors([]);
    state.setSolution({ solution_description: '', didactic_approach: '', didactic_template: { learning_sequences: [] } });
    state.setConsequences({ advantages: [], disadvantages: [] });
    state.setImplementationNotes([]);
    state.setRelatedPatterns([]);
    state.setFeedback({ comments: [] });
    state.setSources([]);
    state.setActors([]);
    state.setEnvironments([]);
  };

  const handleGeneratePDF = async () => {
    try {
      await generatePDF(state);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Fehler bei der PDF-Generierung. Bitte versuchen Sie es erneut.');
    }
  };

  const handleExportMarkdown = () => {
    const template = {
      metadata: state.metadata,
      problem: state.problem,
      context: state.context,
      influence_factors: state.influence_factors,
      solution: state.solution,
      consequences: state.consequences,
      implementation_notes: state.implementation_notes,
      related_patterns: state.related_patterns,
      actors: state.actors,
      environments: state.environments
    };
    const markdown = exportToMarkdown(template);
    downloadFile(markdown, `${template.metadata.title || 'lernpfad'}.md`, 'text/markdown');
  };

  const handleExportHTML = () => {
    const template = {
      metadata: state.metadata,
      problem: state.problem,
      context: state.context,
      influence_factors: state.influence_factors,
      solution: state.solution,
      consequences: state.consequences,
      implementation_notes: state.implementation_notes,
      related_patterns: state.related_patterns,
      actors: state.actors,
      environments: state.environments
    };
    const html = exportToHTML(template);
    downloadFile(html, `${template.metadata.title || 'lernpfad'}.html`, 'text/html');
  };

  const handleExportMoodle = async () => {
    const data = {
      metadata: state.metadata,
      problem: state.problem,
      context: state.context,
      solution: state.solution,
      actors: state.actors,
      environments: state.environments
    };
    await downloadMoodleXML(data, state.metadata.title || 'lernpfad-moodle');
  };

  const handleExportIMSCC = async () => {
    const data = {
      metadata: state.metadata,
      problem: state.problem,
      context: state.context,
      solution: state.solution,
      actors: state.actors,
      environments: state.environments
    };
    await downloadIMSCC(data, state.metadata.title || 'lernpfad');
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      <label className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer flex items-center gap-1 text-sm">
        <DocumentArrowUpIcon className="w-4 h-4" />
        Laden
        <input
          type="file"
          accept=".json"
          onChange={handleLoad}
          className="hidden"
        />
      </label>

      <button
        onClick={handleSave}
        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1 text-sm"
      >
        <DocumentArrowDownIcon className="w-4 h-4" />
        Speichern
      </button>

      {/* Export dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1 text-sm"
        >
          <DocumentTextIcon className="w-4 h-4" />
          Export
          <ChevronDownIcon className="w-3 h-3" />
        </button>
        {showExportMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
            <button
              onClick={() => { handleGeneratePDF(); setShowExportMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              📄 PDF
            </button>
            <button
              onClick={() => { handleExportMarkdown(); setShowExportMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              📝 Markdown
            </button>
            <button
              onClick={() => { handleExportHTML(); setShowExportMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              🌐 HTML
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              onClick={() => { handleExportMoodle(); setShowExportMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              🎓 Moodle XML
            </button>
            <button
              onClick={() => { handleExportIMSCC(); setShowExportMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              📦 IMS Common Cartridge
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleLoadExample}
        className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1 text-sm"
      >
        <DocumentPlusIcon className="w-4 h-4" />
        Beispiel
      </button>
      
      <Link
        to="/community"
        className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1 text-sm"
      >
        <UsersIcon className="w-4 h-4" />
        Community
      </Link>

      <button
        onClick={handleClear}
        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1 text-sm"
      >
        <TrashIcon className="w-4 h-4" />
        Löschen
      </button>
    </div>
  );
}