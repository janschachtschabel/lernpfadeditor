import { z } from 'zod';

// Resource schemas - flexible to accept various AI outputs
const MaterialSchema = z.object({
  id: z.string(),
  name: z.string(),
  material_type: z.string().default('Material'),
  source: z.enum(['manual', 'database', 'filter']).default('manual'),
  access_link: z.string().default(''),
  database_id: z.string().optional(),
  filter_criteria: z.record(z.string()).optional(),
  search_query: z.string().optional(),
  wlo_metadata: z.any().optional()
});

const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  tool_type: z.string().default('Werkzeug'),
  source: z.enum(['manual', 'database', 'filter']).default('manual'),
  access_link: z.string().default(''),
  database_id: z.string().optional(),
  filter_criteria: z.record(z.string()).optional()
});

const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  service_type: z.string().default('Dienst'),
  source: z.enum(['manual', 'database', 'filter']).default('manual'),
  access_link: z.string().default(''),
  database_id: z.string().optional(),
  filter_criteria: z.record(z.string()).optional()
});

// Environment schema - Tools and Services are optional
const EnvironmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().default(''),
  materials: z.array(MaterialSchema).default([]),
  tools: z.array(ToolSchema).default([]),
  services: z.array(ServiceSchema).default([])
});

// Default Actor structure
const defaultActorData = {
  demographic_data: {
    age: 0,
    age_range: '',
    gender: '',
    gender_distribution: '',
    ethnic_background: ''
  },
  education: {
    education_level: '',
    class_level: '',
    subject_focus: ''
  },
  competencies: {
    subject_competencies: [],
    cognitive_competencies: [],
    methodical_competencies: [],
    affective_competencies: [],
    digital_competencies: [],
    language_skills: {
      languages: [],
      proficiency_levels: {}
    }
  },
  social_form: '',
  learning_requirements: {
    learning_preferences: [],
    special_needs: [],
    technical_requirements: []
  },
  interests_and_goals: {
    interests: [],
    goals: [],
    motivation: {
      type: 'mixed',
      level: 'medium'
    }
  },
  social_structure: {
    group_size: 1,
    heterogeneity: ''
  }
};

// Helper to get default actor name based on ID
function getDefaultActorName(id: string, type: string): string {
  if (id === 'A1') return 'Lehrperson';
  if (id === 'A2') return 'Lernende';
  if (type === 'Gruppe') return 'Lerngruppe';
  return 'Akteur';
}

// Helper to fill missing actor fields with defaults
function normalizeActor(actor: any): any {
  if (!actor || typeof actor !== 'object') return null;
  
  const id = actor.id || `A${Date.now()}`;
  const type = actor.type || 'Einzelperson';
  const name = actor.name && actor.name !== 'Unbenannter Akteur' 
    ? actor.name 
    : getDefaultActorName(id, type);
  
  return {
    id: id,
    name: name,
    type: type,
    demographic_data: {
      ...defaultActorData.demographic_data,
      ...(actor.demographic_data || {})
    },
    education: {
      ...defaultActorData.education,
      ...(actor.education || {})
    },
    competencies: {
      ...defaultActorData.competencies,
      ...(actor.competencies || {}),
      language_skills: {
        ...defaultActorData.competencies.language_skills,
        ...(actor.competencies?.language_skills || {})
      }
    },
    social_form: actor.social_form || defaultActorData.social_form,
    learning_requirements: {
      ...defaultActorData.learning_requirements,
      ...(actor.learning_requirements || {})
    },
    interests_and_goals: {
      ...defaultActorData.interests_and_goals,
      ...(actor.interests_and_goals || {}),
      motivation: {
        ...defaultActorData.interests_and_goals.motivation,
        ...(actor.interests_and_goals?.motivation || {})
      }
    },
    social_structure: {
      ...defaultActorData.social_structure,
      ...(actor.social_structure || {})
    }
  };
}

// Helper to normalize activity from AI format to expected format
function normalizeActivity(activity: any, index: number, allActors: any[]): any {
  const activityId = activity.activity_id || activity.id || `ACT${index + 1}`;
  const name = activity.name || activity.activity_title || 'Aktivität';
  const socialForm = activity.social_form || 'Unterricht';
  
  // Get actor refs from the activity
  const actorRefs = activity.actor_refs || [];
  
  // Parse duration - could be "15 Minuten" or just "15"
  let durationNum = 0;
  if (typeof activity.duration === 'number') {
    durationNum = activity.duration;
  } else if (typeof activity.duration === 'string') {
    const match = activity.duration.match(/\d+/);
    durationNum = match ? parseInt(match[0]) : 15;
  }
  
  // ALWAYS create roles for ALL actors
  const activityType = (activity.activity_type || socialForm || '').toLowerCase();
  const isFrontal = activityType.includes('frontal') || activityType.includes('präsentation') || activityType.includes('vortrag');
  const isQuiz = activityType.includes('quiz') || activityType.includes('test') || activityType.includes('übung');
  const isGroupWork = activityType.includes('gruppe') || activityType.includes('partner') || socialForm.toLowerCase().includes('gruppe');
  
  // Create roles for all actors - NEVER skip any actor
  const roles = allActors.map((actor: any, roleIndex: number) => {
    const isReferenced = actorRefs.includes(actor.id);
    const isTeacher = actor.id === 'A1' || actor.name?.includes('Lehr') || 
                      (actor.type === 'Einzelperson' && !actor.name?.includes('Lern'));
    const isLearner = actor.id === 'A2' || actor.name?.includes('Lern') || 
                      actor.name?.includes('Studier') || actor.type === 'Gruppe';
    
    let roleName = socialForm;
    let taskDescription = '';
    let materials: string[] = [];
    
    if (isTeacher) {
      if (isFrontal || isReferenced) {
        // Teacher is presenting/leading
        roleName = socialForm || 'Frontalunterricht';
        taskDescription = activity.description || `Erklärt und präsentiert "${name}"`;
        materials = activity.material_refs || [];
      } else if (isQuiz || isGroupWork) {
        // Teacher supports during student work
        roleName = 'Lernbegleitung';
        taskDescription = `Beobachtet und unterstützt die Lernenden bei "${name}"`;
      } else {
        roleName = 'Moderation';
        taskDescription = `Moderiert und begleitet "${name}"`;
      }
    } else if (isLearner) {
      if (isFrontal) {
        // Students listen during frontal teaching
        roleName = 'Aktives Zuhören';
        taskDescription = `Hört aktiv zu, macht Notizen und stellt Fragen zu "${name}"`;
      } else if (isQuiz) {
        // Students work on quiz
        roleName = socialForm || 'Einzelarbeit';
        taskDescription = activity.description || `Bearbeitet "${name}" selbstständig`;
        materials = activity.material_refs || [];
      } else if (isGroupWork) {
        // Students work in groups
        roleName = socialForm || 'Gruppenarbeit';
        taskDescription = activity.description || `Erarbeitet "${name}" gemeinsam in der Gruppe`;
        materials = activity.material_refs || [];
      } else if (isReferenced) {
        roleName = socialForm || 'Aktive Teilnahme';
        taskDescription = activity.description || `Bearbeitet "${name}"`;
        materials = activity.material_refs || [];
      } else {
        roleName = 'Aktive Teilnahme';
        taskDescription = `Beteiligt sich aktiv an "${name}"`;
      }
    } else {
      // Other actor types
      roleName = isReferenced ? socialForm : 'Teilnahme';
      taskDescription = activity.description || `Nimmt teil an "${name}"`;
      materials = isReferenced ? (activity.material_refs || []) : [];
    }
    
    return {
      role_id: `${activityId}-R${roleIndex + 1}`,
      role_name: roleName,
      actor_id: actor.id,
      task_description: taskDescription,
      learning_environment: activity.environment_ref ? {
        environment_id: activity.environment_ref,
        selected_materials: materials,
        selected_tools: [],
        selected_services: []
      } : undefined
    };
  });
  
  return {
    activity_id: activityId,
    name: name,
    description: activity.description || '',
    duration: durationNum,
    roles: roles,
    goal: activity.goal || activity.objectives?.[0] || '',
    prerequisite_activity: activity.prerequisite_activity || null,
    transition_type: activity.transition_type || 'sequential',
    condition_description: activity.condition_description || null,
    next_activity: activity.next_activity || [],
    assessment: activity.assessment || { type: 'formative', methods: [], criteria: [] }
  };
}

// Helper to normalize learning sequence from AI format
function normalizeLearningSequence(sequence: any, index: number, actors: any[]): any {
  const seqId = sequence.sequence_id || sequence.id || `SEQ${index + 1}`;
  const seqName = sequence.sequence_name || sequence.sequence_title || sequence.name || `Lernsequenz ${index + 1}`;
  
  // If sequence has activities directly (AI format), wrap them in a phase
  let phases = sequence.phases || [];
  
  if ((!phases || phases.length === 0) && sequence.activities && sequence.activities.length > 0) {
    // Convert direct activities to a phase structure
    phases = [{
      phase_id: `${seqId}-P1`,
      phase_name: seqName,
      time_frame: sequence.time_frame || '',
      learning_goal: sequence.learning_goal || sequence.description || '',
      activities: sequence.activities.map((act: any, actIndex: number) => 
        normalizeActivity(act, actIndex, actors)
      ),
      prerequisite_phase: null,
      transition_type: 'sequential',
      condition_description: null,
      next_phase: null
    }];
  } else if (phases && phases.length > 0) {
    // Normalize existing phases
    phases = phases.map((phase: any, phaseIndex: number) => ({
      phase_id: phase.phase_id || `${seqId}-P${phaseIndex + 1}`,
      phase_name: phase.phase_name || phase.name || `Phase ${phaseIndex + 1}`,
      time_frame: phase.time_frame || '',
      learning_goal: phase.learning_goal || '',
      activities: (phase.activities || []).map((act: any, actIndex: number) => 
        normalizeActivity(act, actIndex, actors)
      ),
      prerequisite_phase: phase.prerequisite_phase || null,
      transition_type: phase.transition_type || 'sequential',
      condition_description: phase.condition_description || null,
      next_phase: phase.next_phase || null
    }));
  }
  
  return {
    sequence_id: seqId,
    sequence_name: seqName,
    time_frame: sequence.time_frame || '',
    learning_goal: sequence.learning_goal || sequence.description || '',
    phases: phases,
    prerequisite_sequence: sequence.prerequisite_sequence || null,
    transition_type: sequence.transition_type || 'sequential',
    condition_description: sequence.condition_description || null,
    next_sequence: sequence.next_sequence || null
  };
}

// Helper to normalize environment
function normalizeEnvironment(env: any): any {
  if (!env || typeof env !== 'object') return null;
  
  return {
    id: env.id || `ENV${Date.now()}`,
    name: env.name || 'Unbenannte Umgebung',
    description: env.description || '',
    materials: (env.materials || []).map((m: any) => ({
      id: m.id || `M${Date.now()}`,
      name: m.name || 'Material',
      material_type: m.material_type || 'Material',
      source: m.source || 'manual',
      access_link: m.access_link || '',
      search_query: m.search_query,
      wlo_metadata: m.wlo_metadata
    })),
    tools: (env.tools || []).map((t: any) => ({
      id: t.id || `T${Date.now()}`,
      name: t.name || 'Werkzeug',
      tool_type: t.tool_type || 'Werkzeug',
      source: t.source || 'manual',
      access_link: t.access_link || ''
    })),
    services: (env.services || []).map((s: any) => ({
      id: s.id || `S${Date.now()}`,
      name: s.name || 'Dienst',
      service_type: s.service_type || 'Dienst',
      source: s.source || 'manual',
      access_link: s.access_link || ''
    }))
  };
}

export function validateTemplate(template: unknown) {
  const t = template as any;
  
  // Normalize actors with defaults
  const normalizedActors = (t.actors || [])
    .map(normalizeActor)
    .filter((a: any) => a !== null);
  
  // Normalize environments
  const normalizedEnvironments = (t.environments || [])
    .map(normalizeEnvironment)
    .filter((e: any) => e !== null);
  
  // Return normalized template
  return {
    metadata: {
      title: t.metadata?.title || '',
      description: t.metadata?.description || '',
      keywords: t.metadata?.keywords || [],
      author: t.metadata?.author || '',
      version: t.metadata?.version || '1.0',
      created: t.metadata?.created || new Date().toISOString()
    },
    problem: {
      problem_description: t.problem?.problem_description || t.problem?.description || '',
      description: t.problem?.description || t.problem?.problem_description || '',
      learning_goals: t.problem?.learning_goals || [],
      didactic_keywords: t.problem?.didactic_keywords || [],
      challenges: t.problem?.challenges || []
    },
    context: {
      target_group: t.context?.target_group || '',
      subject: t.context?.subject || '',
      educational_level: t.context?.educational_level || '',
      prerequisites: Array.isArray(t.context?.prerequisites) 
        ? t.context.prerequisites.join(', ') 
        : (t.context?.prerequisites || ''),
      time_frame: t.context?.time_frame || ''
    },
    influence_factors: t.influence_factors || {
      pedagogical: [],
      organizational: [],
      technical: [],
      cultural: []
    },
    solution: {
      solution_description: t.solution?.solution_description || t.solution?.approach || '',
      approach: t.solution?.approach || t.solution?.solution_description || '',
      didactic_approach: t.solution?.didactic_approach || '',
      didactic_template: {
        learning_sequences: (t.solution?.didactic_template?.learning_sequences || [])
          .map((seq: any, index: number) => normalizeLearningSequence(seq, index, normalizedActors))
      }
    },
    consequences: {
      advantages: t.consequences?.advantages || [],
      disadvantages: t.consequences?.disadvantages || []
    },
    implementation_notes: t.implementation_notes || {
      tips: [],
      common_mistakes: [],
      variations: []
    },
    related_patterns: t.related_patterns || [],
    feedback: {
      comments: t.feedback?.comments || []
    },
    sources: t.sources || [],
    actors: normalizedActors,
    environments: normalizedEnvironments
  };
}