import { Link } from 'react-router-dom';
import { SaveLoad } from '../components/SaveLoad';
import { 
  BoltIcon, 
  DocumentPlusIcon, 
  ArrowRightIcon,
  SparklesIcon,
  AcademicCapIcon,
  ClockIcon,
  UsersIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export function Start() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 md:p-12">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm mb-4">
                <SparklesIcon className="w-4 h-4" />
                KI-gestützte Unterrichtsplanung
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Didaktische Lernpfade erstellen
              </h1>
              <p className="text-lg text-blue-100/80 max-w-xl">
                Erstellen Sie strukturierte Unterrichtsabläufe mit KI-Unterstützung und 
                integrieren Sie passende Bildungsressourcen aus der WLO-Datenbank.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <SaveLoad />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link 
          to="/ai-flow-agent"
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
          <BoltIcon className="w-10 h-10 mb-4 opacity-90" />
          <h3 className="text-xl font-bold mb-2">KI-Schnellstart</h3>
          <p className="text-sm text-white/80 mb-4">
            Lassen Sie die KI einen kompletten Unterrichtsablauf generieren
          </p>
          <div className="flex items-center text-sm font-medium">
            Starten <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        
        <Link 
          to="/general-settings"
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
          <DocumentPlusIcon className="w-10 h-10 mb-4 opacity-90" />
          <h3 className="text-xl font-bold mb-2">Manuell erstellen</h3>
          <p className="text-sm text-white/80 mb-4">
            Schritt für Schritt Ihren eigenen Lernpfad aufbauen
          </p>
          <div className="flex items-center text-sm font-medium">
            Beginnen <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        
        <Link 
          to="/community"
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
          <UsersIcon className="w-10 h-10 mb-4 opacity-90" />
          <h3 className="text-xl font-bold mb-2">Community</h3>
          <p className="text-sm text-white/80 mb-4">
            Vorlagen aus der Community laden und anpassen
          </p>
          <div className="flex items-center text-sm font-medium">
            Entdecken <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Workflow Steps */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <AcademicCapIcon className="w-7 h-7 text-blue-600" />
          So funktioniert's
        </h2>
        
        <div className="grid md:grid-cols-6 gap-4">
          {[
            { step: 1, title: 'Allgemeines', desc: 'Titel, Fach & Zielgruppe', color: 'blue' },
            { step: 2, title: 'Didaktik', desc: 'Lernziele definieren', color: 'indigo' },
            { step: 3, title: 'Akteure', desc: 'Lernende beschreiben', color: 'violet' },
            { step: 4, title: 'Umgebungen', desc: 'Ressourcen sammeln', color: 'purple' },
            { step: 5, title: 'WLO Suche', desc: 'Inhalte finden', color: 'fuchsia' },
            { step: 6, title: 'Ablauf', desc: 'Sequenzen planen', color: 'pink' },
          ].map((item, i) => (
            <div key={item.step} className="relative">
              <div className={`flex flex-col items-center text-center p-4 rounded-xl bg-${item.color}-50 border border-${item.color}-100`}>
                <div className={`w-10 h-10 rounded-full bg-${item.color}-500 text-white flex items-center justify-center font-bold mb-3`}>
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
              {i < 5 && (
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <ArrowRightIcon className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">Zeitersparnis</h3>
              <p className="text-amber-800 text-sm">
                Mit KI-Unterstützung erstellen Sie in Minuten, was sonst Stunden dauert. 
                Automatische WLO-Integration findet passende Materialien.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
              <GlobeAltIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-900 mb-2">WLO-Integration</h3>
              <p className="text-green-800 text-sm">
                Direkter Zugriff auf tausende geprüfte Bildungsressourcen aus der 
                Wirlernenonline-Datenbank mit intelligenter Filterung.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-8">
        <Link 
          to="/general-settings"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold text-lg shadow-lg shadow-blue-500/25 transform transition hover:scale-105"
        >
          <DocumentPlusIcon className="w-6 h-6" />
          Neuen Lernpfad erstellen
          <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}