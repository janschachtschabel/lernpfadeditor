import { Link } from 'react-router-dom';
import { useTemplateStore } from '../store/templateStore';
import { SaveLoad } from '../components/SaveLoad';
import { 
  InformationCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const defaultMetadata = {
  title: '',
  description: '',
  keywords: [],
  author: '',
  version: '1.0'
};

const defaultContext = {
  target_group: '',
  subject: '',
  educational_level: '',
  prerequisites: '',
  time_frame: ''
};

export function GeneralSettings() {
  const { metadata = defaultMetadata, setMetadata, context = defaultContext, setContext } = useTemplateStore();

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadata({
      ...metadata,
      keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
    });
  };

  const isComplete = metadata.title && context.subject && context.target_group;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold">1</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Allgemeine Informationen</h1>
              <p className="text-sm text-gray-500">Grundlegende Angaben zu Ihrem Lernpfad</p>
            </div>
          </div>
        </div>
        <SaveLoad />
      </div>

      {/* Progress hint */}
      {!isComplete && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <InformationCircleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Pflichtfelder:</strong> Titel, Fach und Zielgruppe werden für die weitere Bearbeitung benötigt.
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="grid gap-6">
        {/* Title Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Titel & Beschreibung</h2>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                Titel des Lernpfads
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
                placeholder="z.B. Einführung in die Bruchrechnung"
              />
              {metadata.title && (
                <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                  <CheckCircleIcon className="w-4 h-4" />
                  Titel eingegeben
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                placeholder="Beschreiben Sie kurz, worum es in diesem Lernpfad geht..."
              />
            </div>
          </div>
        </div>

        {/* Context Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-violet-600" />
              <h2 className="font-semibold text-gray-900">Kontext & Zielgruppe</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Fach / Themenbereich
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={context.subject}
                  onChange={(e) => setContext({ ...context, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="z.B. Mathematik"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Zielgruppe
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={context.target_group}
                  onChange={(e) => setContext({ ...context, target_group: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="z.B. 6. Klasse Gymnasium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bildungsstufe
                </label>
                <select
                  value={context.educational_level}
                  onChange={(e) => setContext({ ...context, educational_level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                >
                  <option value="">Bitte auswählen...</option>
                  <option value="Primarstufe">Primarstufe</option>
                  <option value="Sekundarstufe I">Sekundarstufe I</option>
                  <option value="Sekundarstufe II">Sekundarstufe II</option>
                  <option value="Berufliche Bildung">Berufliche Bildung</option>
                  <option value="Hochschule">Hochschule</option>
                  <option value="Erwachsenenbildung">Erwachsenenbildung</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zeitrahmen
                </label>
                <input
                  type="text"
                  value={context.time_frame}
                  onChange={(e) => setContext({ ...context, time_frame: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="z.B. 90 Minuten, 2 Unterrichtsstunden"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voraussetzungen
              </label>
              <textarea
                value={context.prerequisites}
                onChange={(e) => setContext({ ...context, prerequisites: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                placeholder="Welche Vorkenntnisse sollten die Lernenden mitbringen?"
              />
            </div>
          </div>
        </div>

        {/* Keywords Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-gray-900">Metadaten</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schlagwörter
                </label>
                <input
                  type="text"
                  value={metadata.keywords.join(', ')}
                  onChange={handleKeywordsChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Kommagetrennt, z.B. Brüche, Grundrechenarten"
                />
                {metadata.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {metadata.keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Autor</label>
                  <input
                    type="text"
                    value={metadata.author}
                    onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Ihr Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                  <input
                    type="text"
                    value={metadata.version}
                    onChange={(e) => setMetadata({ ...metadata, version: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="1.0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Link
          to="/pattern-elements"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            isComplete
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          onClick={(e) => !isComplete && e.preventDefault()}
        >
          Weiter zu Didaktik
          <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}