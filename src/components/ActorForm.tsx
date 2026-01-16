import { useState } from 'react';
import type { Actor, ActorType, MotivationType, MotivationLevel, DifferentiationOption } from '../store/templateStore';

// Helper to safely convert value to array (handles string, array, undefined)
const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

interface ActorFormProps {
  actor: Actor;
  onUpdate: (updates: Partial<Actor>) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ActorForm({ actor, onUpdate, onCancel, onSave }: ActorFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiencyLevel, setNewProficiencyLevel] = useState('A1');

  const proficiencyLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'name':
        return !value ? 'Name ist erforderlich' : '';
      case 'age':
        return value && (isNaN(value) || value < 0) ? 'Alter muss eine positive Zahl sein' : '';
      default:
        return '';
    }
  };

  const handleArrayInput = (e: React.ChangeEvent<HTMLInputElement>, field: string, parentField?: string) => {
    const array = e.target.value.split(',').map(item => item.trim());
    
    if (parentField) {
      onUpdate({
        [parentField]: {
          ...actor[parentField as keyof Actor],
          [field]: array
        }
      });
    } else {
      onUpdate({ [field]: array });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    field: string,
    parentField?: string
  ) => {
    const { value } = e.target;
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));

    if (parentField) {
      onUpdate({
        [parentField]: {
          ...actor[parentField as keyof Actor],
          [field]: value
        }
      });
    } else {
      onUpdate({ [field]: value });
    }
  };

  const handleAddLanguage = () => {
    if (!newLanguage) return;

    const currentLanguages = [...actor.competencies.language_skills.languages];
    const currentProficiencyLevels = { ...actor.competencies.language_skills.proficiency_levels };

    if (!currentLanguages.includes(newLanguage)) {
      currentLanguages.push(newLanguage);
      currentProficiencyLevels[newLanguage] = newProficiencyLevel;

      onUpdate({
        competencies: {
          ...actor.competencies,
          language_skills: {
            languages: currentLanguages,
            proficiency_levels: currentProficiencyLevels
          }
        }
      });
    }

    setNewLanguage('');
    setNewProficiencyLevel('A1');
  };

  const handleRemoveLanguage = (language: string) => {
    const currentLanguages = actor.competencies.language_skills.languages.filter(l => l !== language);
    const currentProficiencyLevels = { ...actor.competencies.language_skills.proficiency_levels };
    delete currentProficiencyLevels[language];

    onUpdate({
      competencies: {
        ...actor.competencies,
        language_skills: {
          languages: currentLanguages,
          proficiency_levels: currentProficiencyLevels
        }
      }
    });
  };

  const handleUpdateProficiencyLevel = (language: string, level: string) => {
    onUpdate({
      competencies: {
        ...actor.competencies,
        language_skills: {
          ...actor.competencies.language_skills,
          proficiency_levels: {
            ...actor.competencies.language_skills.proficiency_levels,
            [language]: level
          }
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Grunddaten */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Grunddaten</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={actor.name}
                onChange={(e) => handleInputChange(e, 'name')}
                placeholder="z.B. Frau Schmidt oder Hauptlerngruppe"
                className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Typ</label>
              <select
                value={actor.type}
                onChange={(e) => onUpdate({ type: e.target.value as ActorType })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              >
                <option value="Einzelperson">Einzelperson</option>
                <option value="Gruppe">Gruppe</option>
                <option value="KI">KI</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Demografische Daten */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Demografische Daten</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
          {actor.type === 'Gruppe' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Altersbereich</label>
                <input
                  type="text"
                  value={actor.demographic_data.age_range || ''}
                  onChange={(e) => handleInputChange(e, 'age_range', 'demographic_data')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="z.B. 14-16" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Geschlechterverteilung</label>
                <input
                  type="text"
                  value={actor.demographic_data.gender_distribution || ''}
                  onChange={(e) => handleInputChange(e, 'gender_distribution', 'demographic_data')}
                  placeholder="z.B. gemischt"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alter</label>
                <input
                  type="number"
                  value={actor.demographic_data.age || ''}
                  onChange={(e) => handleInputChange(e, 'age', 'demographic_data')}
                  placeholder="z.B. 35"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.age ? 'border-red-500' : 'border-gray-200'} focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
                />
                {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Geschlecht</label>
                <input
                  type="text"
                  value={actor.demographic_data.gender || ''}
                  onChange={(e) => handleInputChange(e, 'gender', 'demographic_data')}
                  placeholder="z.B. weiblich, männlich, divers"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </>
          )}
          <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ethnischer Hintergrund</label>
              <input
                type="text"
                value={actor.demographic_data.ethnic_background}
                onChange={(e) => handleInputChange(e, 'ethnic_background', 'demographic_data')}
                placeholder="z.B. deutsch, diverse"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bildung */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Bildung</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bildungsniveau</label>
              <input
                type="text"
                value={actor.education.education_level}
                onChange={(e) => handleInputChange(e, 'education_level', 'education')}
                placeholder="z.B. Master of Education, Sekundarstufe I"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Klassenstufe</label>
              <input
                type="text"
                value={actor.education.class_level}
                onChange={(e) => handleInputChange(e, 'class_level', 'education')}
                placeholder="z.B. 9. Klasse, Oberstufe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fachlicher Schwerpunkt</label>
              <input
                type="text"
                value={actor.education.subject_focus}
                onChange={(e) => handleInputChange(e, 'subject_focus', 'education')}
                placeholder="z.B. Mathematik, Informatik, Naturwissenschaften"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kompetenzen */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Kompetenzen</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fachkompetenzen (kommagetrennt)</label>
            <input
              type="text"
              value={toArray(actor.competencies?.subject_competencies).join(', ')}
              onChange={(e) => handleArrayInput(e, 'subject_competencies', 'competencies')}
              placeholder="z.B. Mathematik, Programmierung, Didaktik"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kognitive Kompetenzen (kommagetrennt)</label>
            <input
              type="text"
              value={toArray(actor.competencies?.cognitive_competencies).join(', ')}
              onChange={(e) => handleArrayInput(e, 'cognitive_competencies', 'competencies')}
              placeholder="z.B. Analytisches Denken, Problemlösung, Kreativität"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Methodische Kompetenzen (kommagetrennt)</label>
            <input
              type="text"
              value={toArray(actor.competencies?.methodical_competencies).join(', ')}
              onChange={(e) => handleArrayInput(e, 'methodical_competencies', 'competencies')}
              placeholder="z.B. Projektmanagement, Zeitmanagement, Präsentation"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Affektive Kompetenzen (kommagetrennt)</label>
            <input
              type="text"
              value={toArray(actor.competencies?.affective_competencies).join(', ')}
              onChange={(e) => handleArrayInput(e, 'affective_competencies', 'competencies')}
              placeholder="z.B. Empathie, Teamfähigkeit, Motivation"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Digitale Kompetenzen (kommagetrennt)</label>
            <input
              type="text"
              value={toArray(actor.competencies?.digital_competencies).join(', ')}
              onChange={(e) => handleArrayInput(e, 'digital_competencies', 'competencies')}
              placeholder="z.B. Office-Programme, Lernplattformen, Mediengestaltung"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          
          {/* Sprachkenntnisse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sprachkenntnisse</label>
            <div className="space-y-2">
              {actor.competencies.language_skills.languages.map(language => (
                <div key={language} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="min-w-[120px] font-medium">{language}</span>
                  <select
                    value={actor.competencies.language_skills.proficiency_levels[language] || 'A1'}
                    onChange={(e) => handleUpdateProficiencyLevel(language, e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  >
                    {proficiencyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemoveLanguage(language)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="z.B. Deutsch, Englisch, Französisch"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <select
                  value={newProficiencyLevel}
                  onChange={(e) => setNewProficiencyLevel(e.target.value)}
                  className="w-24 px-3 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                >
                  {proficiencyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddLanguage}
                  className="px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lernanforderungen */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Lernanforderungen</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lernpräferenzen (kommagetrennt)</label>
            <input
              type="text"
              value={toArray(actor.learning_requirements?.learning_preferences).join(', ')}
              onChange={(e) => handleArrayInput(e, 'learning_preferences', 'learning_requirements')}
              placeholder="z.B. Visuell, Auditiv, Praktisch, Digital"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Besondere Bedürfnisse (kommagetrennt)</label>
            <input
              type="text"
              value={toArray(actor.learning_requirements?.special_needs).join(', ')}
              onChange={(e) => handleArrayInput(e, 'special_needs', 'learning_requirements')}
              placeholder="z.B. Sprachförderung, Barrierefreiheit, Lernunterstützung"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Technische Anforderungen (kommagetrennt)</label>
            <input
              type="text"
              value={toArray(actor.learning_requirements?.technical_requirements).join(', ')}
              onChange={(e) => handleArrayInput(e, 'technical_requirements', 'learning_requirements')}
              placeholder="z.B. Computer, Tablet, Internetzugang"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Interessen und Ziele */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-50 to-sky-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Interessen und Ziele</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interessen (kommagetrennt)</label>
            <input
              type="text"
              value={toArray(actor.interests_and_goals?.interests).join(', ')}
              onChange={(e) => handleArrayInput(e, 'interests', 'interests_and_goals')}
              placeholder="z.B. Digitale Medien, MINT-Fächer, Projektarbeit"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ziele (kommagetrennt)</label>
            <input
              type="text"
              value={toArray(actor.interests_and_goals?.goals).join(', ')}
              onChange={(e) => handleArrayInput(e, 'goals', 'interests_and_goals')}
              placeholder="z.B. Digitale Kompetenz fördern, Inklusion verbessern"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivationstyp</label>
              <select
                value={actor.interests_and_goals.motivation.type}
                onChange={(e) => onUpdate({
                  interests_and_goals: {
                    ...actor.interests_and_goals,
                    motivation: {
                      ...actor.interests_and_goals.motivation,
                      type: e.target.value as MotivationType
                    }
                  }
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              >
                <option value="intrinsic">Intrinsisch</option>
                <option value="extrinsic">Extrinsisch</option>
                <option value="mixed">Gemischt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivationsniveau</label>
              <select
                value={actor.interests_and_goals.motivation.level}
                onChange={(e) => onUpdate({
                  interests_and_goals: {
                    ...actor.interests_and_goals,
                    motivation: {
                      ...actor.interests_and_goals.motivation,
                      level: e.target.value as MotivationLevel
                    }
                  }
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sozialstruktur */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Sozialstruktur</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gruppengröße</label>
              <input
                type={actor.type === 'Gruppe' ? 'text' : 'number'}
                value={actor.social_structure.group_size}
                onChange={(e) => onUpdate({
                  social_structure: {
                    ...actor.social_structure,
                    group_size: actor.type === 'Gruppe' ? e.target.value : parseInt(e.target.value)
                  }
                })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heterogenität</label>
              <input
                type="text"
                value={actor.social_structure.heterogeneity}
                onChange={(e) => onUpdate({
                  social_structure: {
                    ...actor.social_structure,
                    heterogeneity: e.target.value
                  }
                })}
                placeholder="z.B. hoch, mittel, niedrig"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Binnendifferenzierung */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">Binnendifferenzierung</h3>
              <p className="text-sm text-gray-500 mt-1">Unterstützungsmaßnahmen für diese Lerngruppe (z.B. Visuelle Hilfen, Vereinfachte Sprache, Zusatzaufgaben)</p>
            </div>
            <button
              onClick={() => {
                const newOption: DifferentiationOption = {
                  id: `diff_${Date.now()}`,
                  label: '',
                  description: '',
                  hints: []
                };
                onUpdate({ differentiation_options: [...(actor.differentiation_options || []), newOption] });
              }}
              className="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Hinzufügen
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {(actor.differentiation_options || []).map((option, index) => (
            <div key={option.id} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <div className="flex justify-between items-start mb-3">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => {
                    const options = [...(actor.differentiation_options || [])];
                    options[index] = { ...option, label: e.target.value };
                    onUpdate({ differentiation_options: options });
                  }}
                  placeholder="z.B. Visuelle & taktile Unterstützung"
                  className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 font-medium"
                />
                <button
                  onClick={() => {
                    const options = (actor.differentiation_options || []).filter((_, i) => i !== index);
                    onUpdate({ differentiation_options: options });
                  }}
                  className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={option.description}
                onChange={(e) => {
                  const options = [...(actor.differentiation_options || [])];
                  options[index] = { ...option, description: e.target.value };
                  onUpdate({ differentiation_options: options });
                }}
                placeholder="Kurzbeschreibung der Maßnahme"
                className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm mb-3"
              />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Umsetzungshinweise (einer pro Zeile)</label>
                <textarea
                  value={(option.hints || []).join('\n')}
                  onChange={(e) => {
                    const options = [...(actor.differentiation_options || [])];
                    // Keep all lines while typing, including empty ones for newlines
                    options[index] = { ...option, hints: e.target.value.split('\n') };
                    onUpdate({ differentiation_options: options });
                  }}
                  onBlur={(e) => {
                    // Clean up empty lines only on blur
                    const options = [...(actor.differentiation_options || [])];
                    options[index] = { ...option, hints: e.target.value.split('\n').filter(h => h.trim()) };
                    onUpdate({ differentiation_options: options });
                  }}
                  placeholder="z.B. Aufgaben mit Bildkarten darstellen&#10;Konkrete Materialien zum Anfassen bereitstellen&#10;Schritte verbal begleiten"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm"
                />
              </div>
            </div>
          ))}
          
          {(actor.differentiation_options || []).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">Noch keine Differenzierungsoptionen definiert.</p>
              <p className="text-sm">Klicken Sie oben auf "Hinzufügen", um Unterstützungsmaßnahmen anzulegen.</p>
            </div>
          )}
        </div>
      </div>

      {/* Aktionsbuttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={onSave}
          className="px-6 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors disabled:opacity-50"
          disabled={Object.keys(errors).some(key => errors[key])}
        >
          Speichern
        </button>
      </div>
    </div>
  );
}