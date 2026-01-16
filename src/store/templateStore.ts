import { create } from 'zustand';

// Type definitions
export type ActorType = 'Einzelperson' | 'Gruppe' | 'KI';
export type MotivationType = 'intrinsic' | 'extrinsic' | 'mixed';
export type MotivationLevel = 'low' | 'medium' | 'high';

export interface DifferentiationOption {
  id: string;
  label: string;           // z.B. "Leistungsträger", "Förderbedarf", "Sprachförderung"
  description: string;     // Kurze Beschreibung der Zielgruppe
  hints: string[];         // Umsetzungshinweise/Notizen
}

export interface Actor {
  id: string;
  name: string;
  type: ActorType;
  demographic_data: {
    age?: number;
    age_range?: string;
    gender?: string;
    gender_distribution?: string;
    ethnic_background: string;
  };
  education: {
    education_level: string;
    class_level: string;
    subject_focus: string;
  };
  competencies: {
    subject_competencies: string[];
    cognitive_competencies: string[];
    methodical_competencies: string[];
    affective_competencies: string[];
    digital_competencies: string[];
    language_skills: {
      languages: string[];
      proficiency_levels: Record<string, string>;
    };
  };
  social_form: string;
  learning_requirements: {
    learning_preferences: string[];
    special_needs: string[];
    technical_requirements: string[];
  };
  interests_and_goals: {
    interests: string[];
    goals: string[];
    motivation: {
      type: MotivationType;
      level: MotivationLevel;
    };
  };
  social_structure: {
    group_size: number;
    heterogeneity: string;
  };
  differentiation_options?: DifferentiationOption[];
}

export interface FilterCriteria {
  [key: string]: string;
}

export interface Material {
  id: string;
  name: string;
  material_type: string;
  source: 'manual' | 'database' | 'filter';
  access_link: string;
  database_id?: string;
  filter_criteria?: FilterCriteria;
  search_query?: string;
  wlo_metadata?: any[];
}

export interface Tool {
  id: string;
  name: string;
  tool_type: string;
  source: 'manual' | 'database' | 'filter';
  access_link: string;
  database_id?: string;
  filter_criteria?: FilterCriteria;
  wlo_metadata?: any[];
}

export interface Service {
  id: string;
  name: string;
  service_type: string;
  source: 'manual' | 'database' | 'filter';
  access_link: string;
  database_id?: string;
  filter_criteria?: FilterCriteria;
  wlo_metadata?: any[];
}

export interface LearningEnvironment {
  id: string;
  name: string;
  description: string;
  materials: Material[];
  tools: Tool[];
  services: Service[];
}

export interface Assessment {
  type: 'formative' | 'summative';
  methods: string[];
  criteria: string[];
}

export interface Role {
  role_id: string;
  role_name: string;
  actor_id: string;
  task_description: string;
  selected_differentiation?: string[];  // IDs der ausgewählten Differenzierungsoptionen
  learning_environment?: {
    environment_id: string;
    selected_materials?: string[];
    selected_tools?: string[];
    selected_services?: string[];
  };
}

export interface Activity {
  activity_id: string;
  name: string;
  description: string;
  duration: number;
  roles?: Role[];
  goal: string;
  prerequisite_activity: string | null;
  transition_type: 'sequential' | 'parallel' | 'conditional' | 'branching' | 'looping' | 'optional' | 'feedback_loops';
  condition_description: string | null;
  next_activity: string[];
  assessment?: Assessment;
  repeat_until?: string;
  is_optional?: boolean;
}

export interface Phase {
  phase_id: string;
  phase_name: string;
  time_frame: string;
  learning_goal: string;
  activities: Activity[];
  prerequisite_phase: string | null;
  transition_type: 'sequential' | 'parallel' | 'conditional';
  condition_description: string | null;
  next_phase: string | null;
}

export interface LearningSequence {
  sequence_id: string;
  sequence_name: string;
  time_frame: string;
  learning_goal: string;
  phases: Phase[];
  prerequisite_learningsequences: string[];
  transition_type: 'sequential' | 'parallel' | 'conditional' | 'all_completed' | 'one_of';
  condition_description: string | null;
  next_learningsequence: string[];
}

interface TemplateState {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
    version: string;
  };
  problem: {
    problem_description: string;
    learning_goals: string[];
    didactic_keywords: string[];
  };
  context: {
    target_group: string;
    subject: string;
    educational_level: string;
    prerequisites: string;
    time_frame: string;
  };
  influence_factors: Array<{
    factor: string;
    description: string;
  }>;
  solution: {
    solution_description: string;
    didactic_approach: string;
    didactic_template: {
      learning_sequences: LearningSequence[];
    };
  };
  consequences: {
    advantages: string[];
    disadvantages: string[];
  };
  implementation_notes: Array<{
    note_id: string;
    description: string;
  }>;
  related_patterns: string[];
  feedback: {
    comments: Array<string | { date: string; name: string; comment: string }>;
  };
  sources: Array<{
    source_id: string;
    title: string;
    author: string;
    year: number;
    publisher: string;
    url: string;
  }>;
  actors: Actor[];
  environments: LearningEnvironment[];

  // Actions
  setMetadata: (metadata: TemplateState['metadata']) => void;
  setProblem: (problem: TemplateState['problem']) => void;
  setContext: (context: TemplateState['context']) => void;
  setInfluenceFactors: (factors: TemplateState['influence_factors']) => void;
  setSolution: (solution: TemplateState['solution']) => void;
  setConsequences: (consequences: TemplateState['consequences']) => void;
  setImplementationNotes: (notes: TemplateState['implementation_notes']) => void;
  setRelatedPatterns: (patterns: TemplateState['related_patterns']) => void;
  setFeedback: (feedback: TemplateState['feedback']) => void;
  setSources: (sources: TemplateState['sources']) => void;
  
  // Actor actions
  addActor: (actor: Actor) => void;
  updateActor: (id: string, updates: Partial<Actor>) => void;
  removeActor: (id: string) => void;
  setActors: (actors: Actor[]) => void;
  
  // Environment actions
  addEnvironment: (environment: LearningEnvironment) => void;
  updateEnvironment: (id: string, updates: Partial<LearningEnvironment>) => void;
  removeEnvironment: (id: string) => void;
  setEnvironments: (environments: LearningEnvironment[]) => void;
}

const initialState = {
  metadata: {
    title: '',
    description: '',
    keywords: [],
    author: '',
    version: '1.0'
  },
  problem: {
    problem_description: '',
    learning_goals: [],
    didactic_keywords: []
  },
  context: {
    target_group: '',
    subject: '',
    educational_level: '',
    prerequisites: '',
    time_frame: ''
  },
  influence_factors: [],
  solution: {
    solution_description: '',
    didactic_approach: '',
    didactic_template: {
      learning_sequences: []
    }
  },
  consequences: {
    advantages: [],
    disadvantages: []
  },
  implementation_notes: [],
  related_patterns: [],
  feedback: {
    comments: []
  },
  sources: [],
  actors: [],
  environments: []
};

export const useTemplateStore = create<TemplateState>((set) => ({
  ...initialState,
  setMetadata: (metadata) => set({ metadata }),
  setProblem: (problem) => set({ problem }),
  setContext: (context) => set({ context }),
  setInfluenceFactors: (influence_factors) => set({ influence_factors }),
  setSolution: (solution) => set({ solution }),
  setConsequences: (consequences) => set({ consequences }),
  setImplementationNotes: (implementation_notes) => set({ implementation_notes }),
  setRelatedPatterns: (related_patterns) => set({ related_patterns }),
  setFeedback: (feedback) => set({ feedback }),
  setSources: (sources) => set({ sources }),
  
  addActor: (actor) => set((state) => ({ actors: [...state.actors, actor] })),
  updateActor: (id, updates) => set((state) => ({
    actors: state.actors.map((actor) =>
      actor.id === id ? { ...actor, ...updates } : actor
    )
  })),
  removeActor: (id) => set((state) => ({
    actors: state.actors.filter((actor) => actor.id !== id)
  })),
  setActors: (actors) => set({ actors }),
  
  addEnvironment: (environment) => set((state) => ({
    environments: [...state.environments, environment]
  })),
  updateEnvironment: (id, updates) => set((state) => ({
    environments: state.environments.map((env) =>
      env.id === id ? { ...env, ...updates } : env
    )
  })),
  removeEnvironment: (id) => set((state) => ({
    environments: state.environments.filter((env) => env.id !== id)
  })),
  setEnvironments: (environments) => set({ environments })
}));