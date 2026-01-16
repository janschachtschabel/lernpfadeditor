/**
 * Platform-Neutral Course Format
 * 
 * Follows principles:
 * - Separate content, didactics, and technology
 * - Semantic content modeling (not HTML)
 * - Reference media separately
 * - Abstract interactions
 * - Explicit navigation/sequencing
 */

// ============================================
// NEUTRAL COURSE TYPES
// ============================================

export interface NeutralCourse {
  metadata: CourseMetadata;
  modules: CourseModule[];
  resources: ResourceReference[];
  competencies?: string[];
}

export interface CourseMetadata {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  language: string;
  targetGroup: string;
  subject: string;
  educationalLevel: string;
  author: string;
  license: string;
  version: string;
  created: string;
  modified: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  learningObjectives: string[];
  timeFrame: string;
  units: LearningUnit[];
  sequence: SequenceRule[];
}

export interface LearningUnit {
  id: string;
  type: 'information' | 'activation' | 'exercise' | 'application' | 'reflection' | 'assessment';
  title: string;
  description: string;
  duration: number; // minutes
  socialForm: 'individual' | 'pair' | 'group' | 'plenary';
  content: ContentBlock[];
  interactions: Interaction[];
  resources: string[]; // resource IDs
  roles: UnitRole[];
  differentiation?: DifferentiationInfo;
}

export interface UnitRole {
  actorId: string;
  actorName: string;
  roleName: string;
  taskDescription: string;
}

export interface ContentBlock {
  type: 'text' | 'heading' | 'list' | 'image' | 'video' | 'audio' | 'link' | 'embed';
  content: string;
  level?: number; // for headings
  items?: string[]; // for lists
  ref?: string; // for media references
  alt?: string; // for accessibility
  url?: string; // for links
}

export interface Interaction {
  type: 'multiple_choice' | 'single_choice' | 'matching' | 'fill_blank' | 'open_text' | 'discussion';
  question?: string;
  options?: string[];
  correct?: number[];
  feedback?: {
    correct: string;
    incorrect: string;
  };
}

export interface ResourceReference {
  id: string;
  type: 'material' | 'tool' | 'service' | 'external';
  name: string;
  description: string;
  resourceType: string;
  url?: string;
  wloId?: string;
  license?: string;
}

export interface SequenceRule {
  from: string;
  to: string;
  condition?: string;
}

export interface DifferentiationInfo {
  audiences: string[];
  languageLevel?: 'simple' | 'standard' | 'advanced';
  visualSupport?: boolean;
  audioSupport?: boolean;
}

// ============================================
// TRANSFORM LEARNING PATH TO NEUTRAL FORMAT
// ============================================

export function transformToNeutralCourse(data: any): NeutralCourse {
  const courseId = `course_${Date.now()}`;
  const sequences = data.solution?.didactic_template?.learning_sequences || [];
  const environments = data.environments || [];
  const actors = data.actors || [];
  
  // Collect all resources
  const resources: ResourceReference[] = [];
  const resourceMap = new Map<string, string>(); // material/tool id -> resource id
  
  environments.forEach((env: any) => {
    // Materials
    env.materials?.forEach((mat: any) => {
      const resId = `res_mat_${mat.id}`;
      resourceMap.set(mat.id, resId);
      
      // Add main resource
      resources.push({
        id: resId,
        type: 'material',
        name: mat.name,
        description: mat.description || '',
        resourceType: mat.material_type || 'Material',
        url: mat.access_link,
        license: mat.license
      });
      
      // Add WLO resources
      mat.wlo_metadata?.forEach((wlo: any, idx: number) => {
        const wloResId = `res_wlo_${mat.id}_${idx}`;
        resources.push({
          id: wloResId,
          type: 'external',
          name: wlo.title || mat.name,
          description: wlo.description || '',
          resourceType: wlo.resourceType || 'WLO-Ressource',
          url: wlo.wwwUrl,
          wloId: wlo.nodeId
        });
      });
    });
    
    // Tools
    env.tools?.forEach((tool: any) => {
      const resId = `res_tool_${tool.id}`;
      resourceMap.set(tool.id, resId);
      resources.push({
        id: resId,
        type: 'tool',
        name: tool.name,
        description: tool.description || '',
        resourceType: tool.tool_type || 'Werkzeug',
        url: tool.access_link
      });
    });
  });
  
  // Transform modules (sequences → modules)
  const modules: CourseModule[] = sequences.map((seq: any, seqIdx: number) => {
    const moduleId = `mod_${seqIdx}`;
    const units: LearningUnit[] = [];
    const sequenceRules: SequenceRule[] = [];
    
    let prevUnitId: string | null = null;
    
    (seq.phases || []).forEach((phase: any, phaseIdx: number) => {
      (phase.activities || []).forEach((activity: any, actIdx: number) => {
        const unitId = `unit_${seqIdx}_${phaseIdx}_${actIdx}`;
        
        // Map activity type
        const unitType = mapActivityType(activity);
        
        // Build content blocks
        const contentBlocks: ContentBlock[] = [];
        if (activity.description) {
          contentBlocks.push({
            type: 'text',
            content: activity.description
          });
        }
        
        // Collect resources used in this unit
        const unitResources: string[] = [];
        const unitRoles: UnitRole[] = [];
        
        (activity.roles || []).forEach((role: any) => {
          const actor = actors.find((a: any) => a.id === role.actor_id);
          unitRoles.push({
            actorId: role.actor_id,
            actorName: actor?.name || 'Akteur',
            roleName: role.role_name || 'Rolle',
            taskDescription: role.task_description || ''
          });
          
          // Add selected materials/tools as resources
          if (role.learning_environment) {
            role.learning_environment.selected_materials?.forEach((matId: string) => {
              const resId = resourceMap.get(matId);
              if (resId) unitResources.push(resId);
              
              // Also add WLO resources
              const env = environments.find((e: any) => e.id === role.learning_environment?.environment_id);
              const mat = env?.materials?.find((m: any) => m.id === matId);
              mat?.wlo_metadata?.forEach((_: any, idx: number) => {
                unitResources.push(`res_wlo_${matId}_${idx}`);
              });
            });
            
            role.learning_environment.selected_tools?.forEach((toolId: string) => {
              const resId = resourceMap.get(toolId);
              if (resId) unitResources.push(resId);
            });
          }
        });
        
        units.push({
          id: unitId,
          type: unitType,
          title: activity.name || `Aktivität ${actIdx + 1}`,
          description: activity.description || '',
          duration: activity.duration || 0,
          socialForm: mapSocialForm(activity),
          content: contentBlocks,
          interactions: [],
          resources: [...new Set(unitResources)], // deduplicate
          roles: unitRoles
        });
        
        // Build sequence rules
        if (prevUnitId) {
          sequenceRules.push({
            from: prevUnitId,
            to: unitId
          });
        }
        prevUnitId = unitId;
      });
    });
    
    return {
      id: moduleId,
      title: seq.sequence_name || `Modul ${seqIdx + 1}`,
      description: seq.learning_goal || '',
      learningObjectives: seq.learning_goal ? [seq.learning_goal] : [],
      timeFrame: seq.time_frame || '',
      units,
      sequence: sequenceRules
    };
  });
  
  return {
    metadata: {
      id: courseId,
      title: data.metadata?.title || 'Lernpfad',
      shortTitle: (data.metadata?.title || 'Lernpfad').substring(0, 20),
      description: data.metadata?.description || '',
      language: 'de',
      targetGroup: data.context?.target_group || '',
      subject: data.context?.subject || '',
      educationalLevel: data.context?.educational_level || '',
      author: data.metadata?.author || '',
      license: 'CC-BY-SA-4.0',
      version: data.metadata?.version || '1.0',
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    },
    modules,
    resources,
    competencies: data.problem?.learning_goals || []
  };
}

function mapActivityType(activity: any): LearningUnit['type'] {
  const name = (activity.name || '').toLowerCase();
  const desc = (activity.description || '').toLowerCase();
  const combined = name + ' ' + desc;
  
  if (combined.includes('einführung') || combined.includes('information') || combined.includes('erklär')) {
    return 'information';
  }
  if (combined.includes('aktivier') || combined.includes('einstieg') || combined.includes('motivation')) {
    return 'activation';
  }
  if (combined.includes('übung') || combined.includes('aufgabe') || combined.includes('praxis')) {
    return 'exercise';
  }
  if (combined.includes('anwend') || combined.includes('projekt') || combined.includes('transfer')) {
    return 'application';
  }
  if (combined.includes('reflexion') || combined.includes('feedback') || combined.includes('bewert')) {
    return 'reflection';
  }
  if (combined.includes('test') || combined.includes('prüfung') || combined.includes('assessment')) {
    return 'assessment';
  }
  
  return 'exercise'; // default
}

function mapSocialForm(activity: any): LearningUnit['socialForm'] {
  const roles = activity.roles || [];
  if (roles.length === 0) return 'individual';
  
  // Check if group work
  const hasGroup = roles.some((r: any) => 
    (r.role_name || '').toLowerCase().includes('gruppe') ||
    (r.task_description || '').toLowerCase().includes('partner')
  );
  if (hasGroup) return 'group';
  
  // Check if plenary
  const hasPlenary = roles.some((r: any) =>
    (r.task_description || '').toLowerCase().includes('plenum') ||
    (r.task_description || '').toLowerCase().includes('klasse')
  );
  if (hasPlenary) return 'plenary';
  
  return 'individual';
}
