import { OpenAI } from 'openai';
import { 
  BILDUNGSSTUFE_MAPPING, 
  FACH_MAPPING, 
  INHALTSTYP_MAPPING,
  FILTER_PROPERTIES 
} from './mappings';

interface FilterContext {
  itemName: string;
  itemType: 'material' | 'tool' | 'service';
  educationalLevel: string;
  subject: string;
  activityName: string;
  roleName: string;
  taskDescription: string;
  template: any;
}

export async function generateFilterCriteria(
  context: FilterContext,
  apiKey: string,
  selectedFilters: string[],
  addStatus: (message: string) => void
): Promise<Record<string, string>> {
  const client = new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const filterCriteria: Record<string, string> = {};

  for (const filterType of selectedFilters) {
    addStatus(`Processing filter type: ${filterType}`);

    switch (filterType) {
      case FILTER_PROPERTIES.TITLE:
        const searchTerm = await generateSearchTerm(client, context);
        filterCriteria[filterType] = searchTerm;
        addStatus(`Generated search term: "${searchTerm}"`);
        break;

      case FILTER_PROPERTIES.CONTENT_TYPE:
        const contentType = await selectContentType(client, context, addStatus);
        if (contentType) {
          filterCriteria[filterType] = contentType.uri;
          addStatus(`Selected content type: ${contentType.germanLabel} -> ${contentType.uri}`);
        }
        break;

      case FILTER_PROPERTIES.DISCIPLINE:
        const discipline = await selectDiscipline(client, context, addStatus);
        if (discipline) {
          filterCriteria[filterType] = discipline.uri;
          addStatus(`Selected discipline: ${discipline.germanLabel} -> ${discipline.uri}`);
        }
        break;
    }
  }

  return filterCriteria;
}

async function generateSearchTerm(client: OpenAI, context: FilterContext): Promise<string> {
  const prompt = `
Generate a SINGLE, CONCISE search term that represents ONLY the core topic or concept, without including any metadata like:
- Resource type (e.g. "Arbeitsblatt", "Video", "Tool")
- Subject area (e.g. "Mathematik", "Physik")
- Educational level (e.g. "Grundschule", "Sekundarstufe")

Context:
Item: ${context.itemName} (${context.itemType})
Subject: ${context.subject}
Educational Level: ${context.educationalLevel}

IMPORTANT:
- Return ONLY the core topic/concept
- Use ONLY 1-2 words maximum
- EXCLUDE any metadata terms
- Focus on what is being taught/learned
- Do NOT include resource types or context information

Examples:
Input -> Output
"Arbeitsblatt Addition" -> "Addition"
"Mathematik Video Bruchrechnen" -> "Bruchrechnen"
"Physik Simulator Pendel" -> "Pendel"
"Vokabeltrainer Englisch" -> "Vokabeln"
"Chemie Experiment Säuren" -> "Säuren"

Return ONLY the search term without any explanation.`;

  // GPT-5 Responses API
  const response = await (client as any).responses.create({
    model: "gpt-5-mini",
    input: [
      { role: "system", content: "You are a precise search term generator that returns only single concepts." },
      { role: "user", content: prompt }
    ],
    max_output_tokens: 100,
    reasoning: { effort: "low" }
  });

  return response.output_text?.trim() || context.itemName;
}

async function selectContentType(
  client: OpenAI,
  context: FilterContext,
  addStatus: (message: string) => void
) {
  addStatus('Analyzing context to select content type...');

  // Map common material types to content types
  const materialTypeMap: Record<string, string> = {
    'Spielmaterial': 'Lernspiel',
    'Karten': 'Arbeitsblatt',
    'Hardware': 'Tool',
    'Software': 'Tool',
    'Förderung': 'Bildungsangebot'
  };

  // If we have a direct mapping, use it
  if (context.itemType === 'material' && materialTypeMap[context.material_type]) {
    const mappedType = materialTypeMap[context.material_type];
    if (Object.keys(INHALTSTYP_MAPPING).includes(mappedType)) {
      addStatus(`Direct mapping found: ${context.material_type} -> ${mappedType}`);
      return {
        germanLabel: mappedType,
        uri: INHALTSTYP_MAPPING[mappedType as keyof typeof INHALTSTYP_MAPPING]
      };
    }
  }

  // Otherwise, use AI to select content type
  const prompt = `
Based on the following context, select the most appropriate content type from the given options.

Context:
Item: ${context.itemName}
Type: ${context.itemType}
Subject: ${context.subject}
Educational Level: ${context.educationalLevel}

Available options:
${Object.keys(INHALTSTYP_MAPPING).join('\n')}

Return only the exact name of the most appropriate option from the list.`;

  // GPT-5 Responses API
  const response = await (client as any).responses.create({
    model: "gpt-5-mini",
    input: [
      { role: "system", content: "You are a helpful assistant that selects appropriate educational metadata values." },
      { role: "user", content: prompt }
    ],
    max_output_tokens: 100,
    reasoning: { effort: "low" }
  });

  const selectedLabel = response.output_text?.trim();
  
  if (!selectedLabel || !Object.keys(INHALTSTYP_MAPPING).includes(selectedLabel)) {
    addStatus('Could not determine appropriate content type');
    return null;
  }

  return {
    germanLabel: selectedLabel,
    uri: INHALTSTYP_MAPPING[selectedLabel as keyof typeof INHALTSTYP_MAPPING]
  };
}

async function selectDiscipline(
  client: OpenAI,
  context: FilterContext,
  addStatus: (message: string) => void
) {
  addStatus('Analyzing context to select discipline...');

  // If subject is directly in mapping, use it
  if (Object.keys(FACH_MAPPING).includes(context.subject)) {
    addStatus(`Direct mapping found for subject: ${context.subject}`);
    return {
      germanLabel: context.subject,
      uri: FACH_MAPPING[context.subject as keyof typeof FACH_MAPPING]
    };
  }

  // Otherwise, use AI to select discipline
  const prompt = `
Based on the following context, select the most appropriate discipline from the given options.

Context:
Item: ${context.itemName}
Type: ${context.itemType}
Subject: ${context.subject}
Educational Level: ${context.educationalLevel}

Available options:
${Object.keys(FACH_MAPPING).join('\n')}

Return only the exact name of the most appropriate option from the list.`;

  // GPT-5 Responses API
  const response = await (client as any).responses.create({
    model: "gpt-5-mini",
    input: [
      { role: "system", content: "You are a helpful assistant that selects appropriate educational metadata values." },
      { role: "user", content: prompt }
    ],
    max_output_tokens: 100,
    reasoning: { effort: "low" }
  });

  const selectedLabel = response.output_text?.trim();
  
  if (!selectedLabel || !Object.keys(FACH_MAPPING).includes(selectedLabel)) {
    addStatus('Could not determine appropriate discipline');
    return null;
  }

  return {
    germanLabel: selectedLabel,
    uri: FACH_MAPPING[selectedLabel as keyof typeof FACH_MAPPING]
  };
}