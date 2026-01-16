import { Actor } from '../store/templateStore';

interface ActorCardProps {
  actor: Actor;
  onEdit: () => void;
  onDelete: () => void;
}

const defaultEducation = {
  education_level: '',
  class_level: '',
  subject_focus: ''
};

const defaultLanguageSkills = {
  languages: [],
  proficiency_levels: {}
};

const defaultCompetencies = {
  subject_competencies: [],
  cognitive_competencies: [],
  methodical_competencies: [],
  affective_competencies: [],
  digital_competencies: [],
  language_skills: defaultLanguageSkills
};

export function ActorCard({ actor, onEdit, onDelete }: ActorCardProps) {
  const education = actor.education || defaultEducation;
  const competencies = actor.competencies || defaultCompetencies;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{actor.name || 'Unbenannter Akteur'}</h3>
          <p className="text-sm text-gray-500 capitalize">{actor.type}</p>
          <div className="mt-2 space-y-2">
            <p className="text-sm">
              <span className="font-medium">Bildung:</span> {education.education_level}
            </p>
            <p className="text-sm">
              <span className="font-medium">Sprachen:</span>{' '}
              {competencies.language_skills.languages.join(', ') || 'Keine angegeben'}
            </p>
          </div>
        </div>
        <div className="space-x-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm bg-blue-100 rounded hover:bg-blue-200"
          >
            Bearbeiten
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm bg-red-100 rounded hover:bg-red-200"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}