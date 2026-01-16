import { useTemplateStore } from '../store/templateStore';
import { useState } from 'react';
import type { Actor } from '../store/templateStore';
import { ActorForm } from '../components/ActorForm';
import { ActorCard } from '../components/ActorCard';
import { SaveLoad } from '../components/SaveLoad';
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';

const defaultActor: Actor = {
  id: '',
  name: '',
  type: 'Einzelperson',
  demographic_data: {
    ethnic_background: '',
  },
  education: {
    education_level: '',
    class_level: '',
    subject_focus: '',
  },
  competencies: {
    subject_competencies: [],
    cognitive_competencies: [],
    methodical_competencies: [],
    affective_competencies: [],
    digital_competencies: [],
    language_skills: {
      languages: [],
      proficiency_levels: {},
    },
  },
  social_form: '',
  learning_requirements: {
    learning_preferences: [],
    special_needs: [],
    technical_requirements: [],
  },
  interests_and_goals: {
    interests: [],
    goals: [],
    motivation: {
      type: 'intrinsic',
      level: 'medium',
    },
  },
  social_structure: {
    group_size: 1,
    heterogeneity: 'n/a',
  },
};

export function Actors() {
  const { actors = [], addActor, updateActor, removeActor } = useTemplateStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddActor = () => {
    const actorNumber = actors.length + 1;
    const actorId = `actor-${actorNumber}`;
    
    const newActor: Actor = {
      ...defaultActor,
      id: actorId
    };

    addActor(newActor);
    setEditingId(actorId);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center">
            <span className="text-white font-bold">3</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Akteure</h1>
            <p className="text-sm text-gray-500">Lernende und Lehrende definieren</p>
          </div>
        </div>
        <SaveLoad />
      </div>

      {/* Info Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
        <div className="relative z-10 flex items-start gap-4">
          <UserGroupIcon className="w-8 h-8 flex-shrink-0" />
          <div>
            <h2 className="font-semibold mb-1">Wer nimmt am Lernprozess teil?</h2>
            <p className="text-sm text-white/80">
              Definieren Sie Lernende (Einzelpersonen, Gruppen) und Lehrende. 
              Detaillierte Profile ermöglichen personalisierte Unterrichtsabläufe.
            </p>
          </div>
        </div>
      </div>

      {/* Actors List */}
      <div className="space-y-4">
        {actors.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <UserGroupIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">Noch keine Akteure definiert</p>
            <button
              onClick={handleAddActor}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Ersten Akteur hinzufügen
            </button>
          </div>
        ) : (
          <>
            {actors.map((actor) => (
              editingId === actor.id ? (
                <ActorForm
                  key={actor.id}
                  actor={actor}
                  onUpdate={(updates) => updateActor(actor.id, updates)}
                  onCancel={() => setEditingId(null)}
                  onSave={() => setEditingId(null)}
                />
              ) : (
                <div key={actor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <ActorCard
                    actor={actor}
                    onEdit={() => setEditingId(actor.id)}
                    onDelete={() => removeActor(actor.id)}
                  />
                </div>
              )
            ))}
            
            {/* Add Actor Button */}
            <button
              onClick={handleAddActor}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Weiteren Akteur hinzufügen
            </button>
          </>
        )}
      </div>
    </div>
  );
}