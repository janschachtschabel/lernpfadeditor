import { INHALTSTYP_MAPPING, FACH_MAPPING, BILDUNGSSTUFE_MAPPING } from './mappings';
import { searchWLO } from './wloApi';

// Available content types for WLO search - expose to AI prompts
export const WLO_CONTENT_TYPES = Object.keys(INHALTSTYP_MAPPING);

export interface ActivityRoleContext {
  activityId: string;
  activityName: string;
  activityDescription: string;
  roleId: string;
  roleName: string;
  actorId: string;
  actorName: string;
  actorType: string; // 'Einzelperson' (teacher) or 'Gruppe' (learners)
  taskDescription: string;
  environmentId: string | null;
  environmentName: string | null;
  phaseName: string;
  sequenceName: string;
}

export interface ContentSuggestion {
  searchTerm: string;
  contentType: string;
  contentTypeUri: string;
  reasoning: string;
}

export interface WLOContentResult {
  activityId: string;
  roleId: string;
  environmentId: string;
  suggestions: ContentSuggestion[];
  wloResults: any[];
  selectedContents: any[];
}

// Batch processing helper - process items in parallel batches
async function processBatched<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 20
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

// Default learning environment to use when none is linked
export const DEFAULT_ENVIRONMENT = {
  id: 'ENV-DEFAULT',
  name: 'Standard-Lernumgebung',
  description: 'Digitale Lernumgebung für WLO-Inhalte',
  materials: [],
  tools: [],
  services: []
};

/**
 * Suggests WLO content for a specific activity/role combination using AI
 */
export async function suggestContentForRole(
  context: ActivityRoleContext,
  templateContext: {
    subject: string;
    educationalLevel: string;
    targetGroup: string;
  },
  apiKey: string,
  model: string,
  addStatus: (message: string) => void
): Promise<ContentSuggestion[]> {
  const isTeacher = context.actorType === 'Einzelperson' || 
                    context.actorName?.toLowerCase().includes('lehr') ||
                    context.actorId === 'A1';

  const prompt = `Schlage 1-2 passende digitale Lernmaterialien für diese Aktivität/Rolle vor.

AKTIVITÄT: ${context.activityName}
BESCHREIBUNG: ${context.activityDescription}
PHASE: ${context.phaseName}

ROLLE: ${context.roleName}
AKTEUR: ${context.actorName} (${isTeacher ? 'Lehrperson' : 'Lernende'})
AUFGABE: ${context.taskDescription}

LERNUMGEBUNG: ${context.environmentName || 'Keine spezifische'}

KONTEXT:
- Fach: ${templateContext.subject}
- Bildungsstufe: ${templateContext.educationalLevel}
- Zielgruppe: ${templateContext.targetGroup}

VERFÜGBARE INHALTSTYPEN (NUR diese verwenden!):
${WLO_CONTENT_TYPES.map(t => `- "${t}"`).join('\n')}

REGELN:
1. Suchbegriff: KURZ (1-3 Wörter), NUR das Thema, KEINE Inhaltstypen im Begriff
   ✅ "Addition", "Bruchrechnung", "Photosynthese"
   ❌ "Addition Video", "Arbeitsblatt Bruchrechnung"

2. Inhaltstyp: EXAKT aus der Liste oben wählen

3. Für ${isTeacher ? 'LEHRPERSON' : 'LERNENDE'} passende Materialien:
   ${isTeacher ? 
     '- Präsentation, Unterrichtsidee, Unterrichtsplan, Methoden' : 
     '- Arbeitsblatt, Video, Interaktives Medium, Lernspiel, Übungsmaterial, Tests / Fragebögen'}

Antworte mit JSON:
{
  "suggestions": [
    {
      "searchTerm": "kurzer Suchbegriff",
      "contentType": "exakter Typ aus Liste",
      "reasoning": "Warum passt dieses Material zur Aufgabe"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: 'Du bist ein Experte für digitale Bildungsressourcen. Antworte nur mit JSON.' },
          { role: 'user', content: prompt }
        ],
        max_output_tokens: 500,
        reasoning: { effort: 'low' }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let outputText = data.output_text;
    if (!outputText && data.output) {
      const messageItem = data.output.find((item: any) => item.type === 'message');
      if (messageItem?.content) {
        const textContent = messageItem.content.find((c: any) => c.type === 'output_text');
        outputText = textContent?.text;
      }
    }

    if (!outputText) {
      addStatus('    ⚠️ Keine KI-Antwort für Inhaltsvorschläge');
      return [];
    }

    const jsonMatch = outputText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      addStatus('    ⚠️ Kein JSON in KI-Antwort');
      return [];
    }

    const result = JSON.parse(jsonMatch[0]);
    const suggestions: ContentSuggestion[] = [];

    for (const s of (result.suggestions || [])) {
      // Validate content type exists in mapping
      const contentTypeUri = INHALTSTYP_MAPPING[s.contentType as keyof typeof INHALTSTYP_MAPPING];
      if (contentTypeUri) {
        suggestions.push({
          searchTerm: s.searchTerm,
          contentType: s.contentType,
          contentTypeUri,
          reasoning: s.reasoning
        });
      } else {
        addStatus(`    ⚠️ Unbekannter Inhaltstyp: ${s.contentType}`);
      }
    }

    return suggestions;
  } catch (error) {
    addStatus(`    ❌ Fehler bei Inhaltsvorschlag: ${error instanceof Error ? error.message : 'Unbekannt'}`);
    return [];
  }
}

/**
 * Searches WLO and ranks results for the best matches
 */
export async function searchAndRankWLO(
  suggestion: ContentSuggestion,
  context: ActivityRoleContext,
  templateContext: {
    subject: string;
    educationalLevel: string;
  },
  filters: {
    useSubjectFilter: boolean;
    useEducationalLevelFilter: boolean;
  },
  apiKey: string,
  model: string,
  addStatus: (message: string) => void
): Promise<any[]> {
  // Build search criteria
  const properties = ['cclom:title'];
  const values = [suggestion.searchTerm];

  // Add content type filter
  properties.push('ccm:oeh_lrt_aggregated');
  values.push(suggestion.contentTypeUri);

  // Optional subject filter
  if (filters.useSubjectFilter && templateContext.subject) {
    const subjectUri = FACH_MAPPING[templateContext.subject as keyof typeof FACH_MAPPING];
    if (subjectUri) {
      properties.push('ccm:taxonid');
      values.push(subjectUri);
      addStatus(`      📚 +Filter: ${templateContext.subject}`);
    }
  }

  // Optional educational level filter
  if (filters.useEducationalLevelFilter && templateContext.educationalLevel) {
    const eduUri = BILDUNGSSTUFE_MAPPING[templateContext.educationalLevel as keyof typeof BILDUNGSSTUFE_MAPPING];
    if (eduUri) {
      properties.push('ccm:educationalcontext');
      values.push(eduUri);
      addStatus(`      🎓 +Filter: ${templateContext.educationalLevel}`);
    }
  }

  addStatus(`      🔍 Suche: "${suggestion.searchTerm}" [${suggestion.contentType}]`);

  try {
    // Search WLO for ~30 candidates
    const searchResults = await searchWLO({
      properties,
      values,
      maxItems: 30,
      combineMode: 'AND'
    });

    let nodes = searchResults.nodes || [];

    // Fallback: try without content type filter if no results
    if (nodes.length === 0) {
      addStatus('      🔄 Keine Ergebnisse, suche ohne Inhaltstyp-Filter...');
      const fallbackResults = await searchWLO({
        properties: ['cclom:title'],
        values: [suggestion.searchTerm],
        maxItems: 30,
        combineMode: 'OR'
      });
      nodes = fallbackResults.nodes || [];
    }

    if (nodes.length === 0) {
      addStatus('      ℹ️ Keine WLO-Ergebnisse gefunden');
      return [];
    }

    addStatus(`      📊 ${nodes.length} Kandidaten gefunden`);

    // Map to content format
    const contents = nodes.map((node: any) => {
      const nodeId = node.ref?.id || node.properties['sys:node-uuid']?.[0];
      const directUrl = node.properties['ccm:wwwurl']?.[0];
      // Fallback to edu-sharing render URL if no direct URL available
      const renderUrl = nodeId 
        ? `https://redaktion.openeduhub.net/edu-sharing/components/render/${nodeId}`
        : null;
      
      return {
        nodeId,
        title: node.properties['cclom:title']?.[0] || 'Ohne Titel',
        description: node.properties['cclom:general_description']?.[0] || '',
        subject: node.properties['ccm:taxonid_DISPLAYNAME']?.[0] || '',
        educationalContext: node.properties['ccm:educationalcontext_DISPLAYNAME'] || [],
        resourceType: node.properties['ccm:oeh_lrt_aggregated_DISPLAYNAME']?.[0] || 'Lernressource',
        wwwUrl: directUrl || renderUrl,
        previewUrl: nodeId
          ? `https://redaktion.openeduhub.net/edu-sharing/preview?nodeId=${nodeId}&storeProtocol=workspace&storeId=SpacesStore`
          : null
      };
    });

    // Rank with AI
    addStatus('      🤖 KI bewertet Relevanz...');
    const rankedContents = await rankContentsWithAI(
      contents,
      context,
      suggestion,
      apiKey,
      model
    );

    // Return top 3
    const topContents = rankedContents.slice(0, 3);
    addStatus(`      ✅ ${topContents.length} beste Inhalte ausgewählt`);

    return topContents;
  } catch (error) {
    addStatus(`      ❌ WLO-Suche fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannt'}`);
    return [];
  }
}

/**
 * Ranks WLO contents using AI based on relevance to activity/role
 */
async function rankContentsWithAI(
  contents: any[],
  context: ActivityRoleContext,
  suggestion: ContentSuggestion,
  apiKey: string,
  model: string
): Promise<any[]> {
  if (contents.length === 0) return [];
  if (contents.length <= 3) return contents.map(c => ({ ...c, relevanceScore: 80 }));

  const contentSummaries = contents.slice(0, 20).map((c, i) => ({
    index: i,
    title: c.title,
    description: (c.description || '').substring(0, 100),
    type: c.resourceType
  }));

  const prompt = `Bewerte diese Bildungsressourcen nach Relevanz.

AKTIVITÄT: ${context.activityName}
ROLLE: ${context.roleName} (${context.actorName})
AUFGABE: ${context.taskDescription}
GESUCHTER INHALTSTYP: ${suggestion.contentType}

RESSOURCEN:
${JSON.stringify(contentSummaries, null, 2)}

Wähle die 3 relevantesten aus.
Antworte mit JSON: { "rankings": [{ "index": 0, "score": 95 }, ...] }
Score: 0-100. Nur die besten 3.`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: 'Du bist ein Experte für didaktische Ressourcenauswahl. Antworte nur mit JSON.' },
          { role: 'user', content: prompt }
        ],
        max_output_tokens: 300,
        reasoning: { effort: 'low' }
      })
    });

    if (!response.ok) {
      return contents.slice(0, 3).map(c => ({ ...c, relevanceScore: 70 }));
    }

    const data = await response.json();
    let outputText = data.output_text;
    if (!outputText && data.output) {
      const messageItem = data.output.find((item: any) => item.type === 'message');
      if (messageItem?.content) {
        const textContent = messageItem.content.find((c: any) => c.type === 'output_text');
        outputText = textContent?.text;
      }
    }

    if (!outputText) return contents.slice(0, 3);

    const jsonMatch = outputText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return contents.slice(0, 3);

    const result = JSON.parse(jsonMatch[0]);
    const rankings = result.rankings || [];

    return rankings
      .filter((r: any) => r.index >= 0 && r.index < contents.length)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3)
      .map((r: any) => ({
        ...contents[r.index],
        relevanceScore: r.score
      }));
  } catch {
    return contents.slice(0, 3).map(c => ({ ...c, relevanceScore: 70 }));
  }
}

/**
 * Process all activities and roles to suggest and fetch WLO content
 */
export async function processActivitiesForWLOContent(
  template: any,
  apiKey: string,
  model: string,
  filters: {
    useSubjectFilter: boolean;
    useEducationalLevelFilter: boolean;
  },
  addStatus: (message: string) => void
): Promise<{
  updatedEnvironments: any[];
  roleContentAssignments: Map<string, string[]>; // roleId -> material IDs
}> {
  const environments = [...(template.environments || [])];
  const actors = template.actors || [];
  const sequences = template.solution?.didactic_template?.learning_sequences || [];
  const roleContentAssignments = new Map<string, string[]>();

  // Ensure we have at least a default environment
  let defaultEnvIndex = environments.findIndex(e => e.id === DEFAULT_ENVIRONMENT.id);
  if (defaultEnvIndex === -1) {
    environments.push({ ...DEFAULT_ENVIRONMENT, materials: [], tools: [], services: [] });
    defaultEnvIndex = environments.length - 1;
  }

  const templateContext = {
    subject: template.context?.subject || '',
    educationalLevel: template.context?.educational_level || '',
    targetGroup: template.context?.target_group || ''
  };

  addStatus('\n🎯 Starte parallele WLO-Inhaltssuche (max. 20 gleichzeitig)...');

  // Collect all role contexts first
  interface RoleTask {
    context: ActivityRoleContext;
    envId: string;
    envIndex: number;
  }
  
  const roleTasks: RoleTask[] = [];
  
  for (const sequence of sequences) {
    for (const phase of (sequence.phases || [])) {
      for (const activity of (phase.activities || [])) {
        for (const role of (activity.roles || [])) {
          const actor = actors.find((a: any) => a.id === role.actor_id);
          if (!actor) continue;

          let envId = role.learning_environment?.environment_id;
          let envIndex = environments.findIndex(e => e.id === envId);
          
          if (envIndex === -1) {
            envId = DEFAULT_ENVIRONMENT.id;
            envIndex = defaultEnvIndex;
          }

          const env = environments[envIndex];

          roleTasks.push({
            context: {
              activityId: activity.activity_id,
              activityName: activity.name,
              activityDescription: activity.description || '',
              roleId: role.role_id,
              roleName: role.role_name,
              actorId: actor.id,
              actorName: actor.name,
              actorType: actor.type,
              taskDescription: role.task_description || '',
              environmentId: envId,
              environmentName: env?.name || null,
              phaseName: phase.phase_name,
              sequenceName: sequence.sequence_name
            },
            envId,
            envIndex
          });
        }
      }
    }
  }

  addStatus(`📊 ${roleTasks.length} Rollen gefunden, starte parallele Verarbeitung...`);

  // Process roles in parallel batches of 20
  const processRole = async (task: RoleTask) => {
    const { context, envId, envIndex } = task;
    const materialIds: string[] = [];
    const materials: any[] = [];

    try {
      // Step 1: Get content suggestions from AI
      const suggestions = await suggestContentForRole(
        context,
        templateContext,
        apiKey,
        model,
        (msg) => {} // Silent during parallel processing
      );

      if (suggestions.length === 0) {
        return { roleId: context.roleId, materialIds: [], materials: [], envIndex };
      }

      // Step 2: Process suggestions in parallel too
      const suggestionResults = await Promise.all(
        suggestions.map(async (suggestion) => {
          const wloContents = await searchAndRankWLO(
            suggestion,
            context,
            templateContext,
            filters,
            apiKey,
            model,
            (msg) => {} // Silent during parallel processing
          );

          if (wloContents.length > 0) {
            const materialId = `${envId}-M${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
            return {
              materialId,
              material: {
                id: materialId,
                name: `${suggestion.searchTerm} ${suggestion.contentType}`,
                material_type: suggestion.contentType,
                source: 'database' as const,
                access_link: wloContents[0]?.wwwUrl || '',
                search_query: suggestion.searchTerm,
                wlo_metadata: wloContents
              }
            };
          }
          return null;
        })
      );

      for (const result of suggestionResults) {
        if (result) {
          materialIds.push(result.materialId);
          materials.push(result.material);
        }
      }

      return { roleId: context.roleId, roleName: context.roleName, actorName: context.actorName, materialIds, materials, envIndex };
    } catch (error) {
      return { roleId: context.roleId, materialIds: [], materials: [], envIndex, error: true };
    }
  };

  // Process in batches of 20
  const results = await processBatched(roleTasks, processRole, 20);

  // Aggregate results
  let successCount = 0;
  let materialCount = 0;
  
  for (const result of results) {
    if (result.materialIds.length > 0) {
      roleContentAssignments.set(result.roleId, result.materialIds);
      
      // Add materials to environment
      for (const material of result.materials) {
        environments[result.envIndex].materials.push(material);
        materialCount++;
      }
      
      successCount++;
      addStatus(`  ✅ ${result.actorName}: ${result.roleName} (${result.materialIds.length} Materialien)`);
    }
  }

  addStatus(`\n✅ WLO-Suche abgeschlossen: ${materialCount} Materialien für ${successCount}/${roleTasks.length} Rollen`);

  return {
    updatedEnvironments: environments,
    roleContentAssignments
  };
}
