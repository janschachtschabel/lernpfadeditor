import { useTemplateStore } from '../store/templateStore';
import { SaveLoad } from '../components/SaveLoad';
import { 
  LightBulbIcon,
  AcademicCapIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

const defaultProblem = {
  problem_description: '',
  learning_goals: [],
  didactic_keywords: []
};


const defaultSolution = {
  solution_description: '',
  didactic_approach: '',
  didactic_template: { learning_sequences: [] }
};

const defaultConsequences = {
  advantages: [],
  disadvantages: []
};

const defaultFeedback = {
  comments: []
};

export function PatternElements() {
  const { 
    problem = defaultProblem,
    setProblem,
    influence_factors = [],
    setInfluenceFactors,
    solution = defaultSolution,
    setSolution,
    consequences = defaultConsequences,
    setConsequences,
    implementation_notes = [],
    setImplementationNotes,
    related_patterns = [],
    setRelatedPatterns,
    feedback = defaultFeedback,
    setFeedback,
    sources = [],
    setSources
  } = useTemplateStore();

  const handleLearningGoalsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProblem({
      ...problem,
      learning_goals: e.target.value.split('\n')
    });
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProblem({
      ...problem,
      didactic_keywords: e.target.value.split(',').map(k => k.trim())
    });
  };

  const handleAdvantagesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConsequences({
      ...consequences,
      advantages: e.target.value.split('\n')
    });
  };

  const handleDisadvantagesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConsequences({
      ...consequences,
      disadvantages: e.target.value.split('\n')
    });
  };

  const handleRelatedPatternsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRelatedPatterns(e.target.value.split('\n'));
  };

  const handleAddImplementationNote = () => {
    const noteNumber = implementation_notes.length + 1;
    const noteId = `Note${noteNumber}`;
    
    setImplementationNotes([
      ...implementation_notes,
      { note_id: noteId, description: '' }
    ]);
  };

  const handleUpdateImplementationNote = (index: number, description: string) => {
    const newNotes = [...implementation_notes];
    newNotes[index] = { ...newNotes[index], description };
    setImplementationNotes(newNotes);
  };

  const handleRemoveImplementationNote = (index: number) => {
    setImplementationNotes(implementation_notes.filter((_, i) => i !== index));
  };

  const handleAddSource = () => {
    const sourceNumber = sources.length + 1;
    const sourceId = `S${sourceNumber}`;
    
    setSources([
      ...sources,
      {
        source_id: sourceId,
        title: '',
        author: '',
        year: new Date().getFullYear(),
        publisher: '',
        url: ''
      }
    ]);
  };

  const handleUpdateSource = (index: number, updates: Partial<typeof sources[0]>) => {
    const newSources = [...sources];
    newSources[index] = { ...newSources[index], ...updates };
    setSources(newSources);
  };

  const handleRemoveSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const handleAddFeedback = () => {
    const newComment = {
      date: new Date().toISOString().split('T')[0],
      name: '',
      comment: ''
    };
    
    setFeedback({
      comments: [...feedback.comments, newComment]
    });
  };

  const handleUpdateFeedback = (index: number, updates: Partial<typeof feedback.comments[0]>) => {
    const newComments = [...feedback.comments];
    newComments[index] = { ...newComments[index], ...updates };
    setFeedback({ comments: newComments });
  };

  const handleRemoveFeedback = (index: number) => {
    setFeedback({
      comments: feedback.comments.filter((_, i) => i !== index)
    });
  };

  const hasLearningGoals = problem.learning_goals.filter(g => g.trim()).length > 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold">2</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Didaktische Grundlagen</h1>
            <p className="text-sm text-gray-500">Lernziele, Problemstellung und Lösungsansatz</p>
          </div>
        </div>
        <SaveLoad />
      </div>

      {/* Problem & Learning Goals Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Lernziele & Problemstellung</h2>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              Lernziele
              <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 font-normal">(eines pro Zeile)</span>
            </label>
            <textarea
              value={problem.learning_goals.join('\n')}
              onChange={handleLearningGoalsChange}
              rows={4}
              placeholder="Die Lernenden können...&#10;- Brüche addieren und subtrahieren&#10;- Brüche in Dezimalzahlen umwandeln&#10;- Bruchrechnung im Alltag anwenden"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            />
            {hasLearningGoals && (
              <div className="flex flex-wrap gap-2 mt-3">
                {problem.learning_goals.filter(g => g.trim()).map((goal, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    {goal.length > 50 ? goal.substring(0, 50) + '...' : goal}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Problembeschreibung</label>
            <textarea
              value={problem.problem_description}
              onChange={(e) => setProblem({ ...problem, problem_description: e.target.value })}
              rows={3}
              placeholder="Welche Herausforderung soll mit diesem Lernpfad gelöst werden?"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Didaktische Schlüsselwörter</label>
            <input
              type="text"
              value={problem.didactic_keywords.join(', ')}
              onChange={handleKeywordsChange}
              placeholder="z.B. Problembasiertes Lernen, Gruppenarbeit, Differenzierung"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {problem.didactic_keywords.length > 0 && problem.didactic_keywords[0] && (
              <div className="flex flex-wrap gap-2 mt-3">
                {problem.didactic_keywords.filter(k => k).map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{kw}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Solution Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">Didaktischer Ansatz</h2>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lösungsbeschreibung</label>
            <textarea
              value={solution.solution_description}
              onChange={(e) => setSolution({ ...solution, solution_description: e.target.value })}
              rows={3}
              placeholder="Wie wird das didaktische Problem gelöst?"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Didaktischer Ansatz</label>
            <textarea
              value={solution.didactic_approach}
              onChange={(e) => setSolution({ ...solution, didactic_approach: e.target.value })}
              rows={3}
              placeholder="z.B. Problemorientiertes Lernen, Entdeckendes Lernen, Kooperatives Lernen"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Consequences Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ScaleIcon className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-gray-900">Vor- und Nachteile</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">Vorteile</label>
              <textarea
                value={consequences.advantages.join('\n')}
                onChange={handleAdvantagesChange}
                rows={4}
                placeholder="Ein Vorteil pro Zeile..."
                className="w-full px-4 py-3 rounded-xl border border-green-200 bg-green-50/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">Nachteile / Herausforderungen</label>
              <textarea
                value={consequences.disadvantages.join('\n')}
                onChange={handleDisadvantagesChange}
                rows={4}
                placeholder="Eine Herausforderung pro Zeile..."
                className="w-full px-4 py-3 rounded-xl border border-red-200 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Influence Factors Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Einflussfaktoren</h2>
        <div className="space-y-4">
          {influence_factors.map((factor, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={factor.factor}
                  onChange={(e) => {
                    const newFactors = [...influence_factors];
                    newFactors[index] = { ...factor, factor: e.target.value };
                    setInfluenceFactors(newFactors);
                  }}
                  placeholder="z.B. Sprachliche Heterogenität, Technische Ausstattung"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <textarea
                  value={factor.description}
                  onChange={(e) => {
                    const newFactors = [...influence_factors];
                    newFactors[index] = { ...factor, description: e.target.value };
                    setInfluenceFactors(newFactors);
                  }}
                  placeholder="Beschreiben Sie, wie dieser Faktor das Lernen beeinflusst..."
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  const newFactors = influence_factors.filter((_, i) => i !== index);
                  setInfluenceFactors(newFactors);
                }}
                className="mt-1 p-2 text-red-600 hover:text-red-800"
              >
                Entfernen
              </button>
            </div>
          ))}
          <button
            onClick={() => setInfluenceFactors([...influence_factors, { factor: '', description: '' }])}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Faktor hinzufügen
          </button>
        </div>
      </div>

      {/* Solution Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Lösung</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Lösungsbeschreibung</label>
            <textarea
              value={solution.solution_description}
              onChange={(e) => setSolution({ ...solution, solution_description: e.target.value })}
              rows={4}
              placeholder="Beschreiben Sie die didaktische Lösung und wie sie das Problem addressiert..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Didaktischer Ansatz</label>
            <textarea
              value={solution.didactic_approach}
              onChange={(e) => setSolution({ ...solution, didactic_approach: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="z.B. Problemorientiertes Lernen, Entdeckendes Lernen, etc."
            />
          </div>
        </div>
      </div>

      {/* Consequences Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Konsequenzen</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vorteile (einer pro Zeile)</label>
            <textarea
              value={consequences.advantages.join('\n')}
              onChange={handleAdvantagesChange}
              rows={4}
              placeholder="z.B.:&#10;- Fördert selbstständiges Lernen&#10;- Ermöglicht individuelle Lernwege&#10;- Stärkt soziale Kompetenzen"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nachteile (einer pro Zeile)</label>
            <textarea
              value={consequences.disadvantages.join('\n')}
              onChange={handleDisadvantagesChange}
              rows={4}
              placeholder="z.B.:&#10;- Höherer Vorbereitungsaufwand&#10;- Technische Abhängigkeiten&#10;- Komplexere Koordination"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Implementation Notes Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Umsetzungshinweise</h2>
        <div className="space-y-4">
          {implementation_notes.map((note, index) => (
            <div key={note.note_id} className="flex gap-4 items-start">
              <div className="flex-1">
                <textarea
                  value={note.description}
                  onChange={(e) => handleUpdateImplementationNote(index, e.target.value)}
                  rows={2}
                  placeholder="z.B. Technische Ausstattung vorab prüfen, Materialien vorbereiten..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => handleRemoveImplementationNote(index)}
                className="mt-1 p-2 text-red-600 hover:text-red-800"
              >
                Entfernen
              </button>
            </div>
          ))}
          <button
            onClick={handleAddImplementationNote}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Hinweis hinzufügen
          </button>
        </div>
      </div>

      {/* Related Patterns Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Verwandte Muster</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Verwandte Muster (eines pro Zeile)</label>
          <textarea
            value={related_patterns.join('\n')}
            onChange={handleRelatedPatternsChange}
            rows={4}
            placeholder="z.B.:&#10;Kooperatives Lernen&#10;Projektbasierter Unterricht&#10;Differenzierte Instruktion"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Feedback</h2>
        <div className="space-y-4">
          {feedback.comments.map((comment, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Datum</label>
                  <input
                    type="date"
                    value={comment.date}
                    onChange={(e) => handleUpdateFeedback(index, { date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={comment.name}
                    onChange={(e) => handleUpdateFeedback(index, { name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kommentar</label>
                <textarea
                  value={comment.comment}
                  onChange={(e) => handleUpdateFeedback(index, { comment: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => handleRemoveFeedback(index)}
                className="mt-2 text-red-600 hover:text-red-800"
              >
                Entfernen
              </button>
            </div>
          ))}
          <button
            onClick={handleAddFeedback}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Feedback hinzufügen
          </button>
        </div>
      </div>

      {/* Sources Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Quellen</h2>
        <div className="space-y-4">
          {sources.map((source, index) => (
            <div key={source.source_id} className="border p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titel</label>
                  <input
                    type="text"
                    value={source.title}
                    onChange={(e) => handleUpdateSource(index, { title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Autor</label>
                  <input
                    type="text"
                    value={source.author}
                    onChange={(e) => handleUpdateSource(index, { author: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jahr</label>
                  <input
                    type="number"
                    value={source.year}
                    onChange={(e) => handleUpdateSource(index, { year: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verlag</label>
                  <input
                    type="text"
                    value={source.publisher}
                    onChange={(e) => handleUpdateSource(index, { publisher: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <input
                  type="url"
                  value={source.url}
                  onChange={(e) => handleUpdateSource(index, { url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => handleRemoveSource(index)}
                className="mt-2 text-red-600 hover:text-red-800"
              >
                Entfernen
              </button>
            </div>
          ))}
          <button
            onClick={handleAddSource}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quelle hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}