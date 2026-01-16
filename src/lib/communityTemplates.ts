import { Template } from './types';

interface CommunityTemplate {
  name: string;
  subject: string;
  template: Template;
}

export async function findRelevantTemplates(currentTemplate: Template): Promise<CommunityTemplate[]> {
  try {
    // Load community template index
    const indexResponse = await fetch('/community-templates/index.json');
    const index = await indexResponse.json();

    // Get current subject and keywords
    const currentSubject = currentTemplate.context?.subject?.toLowerCase() || '';
    const currentKeywords = currentTemplate.metadata?.keywords?.map(k => k.toLowerCase()) || [];

    const relevantTemplates: CommunityTemplate[] = [];

    // Load and check each template
    for (const templateInfo of index.templates) {
      const templateResponse = await fetch(`/community-templates/${templateInfo.file}`);
      const template = await templateResponse.json();

      // Check subject match
      const templateSubject = template.context?.subject?.toLowerCase() || '';
      const subjectMatch = templateSubject && currentSubject && 
        (templateSubject.includes(currentSubject) || currentSubject.includes(templateSubject));

      // Check keyword overlap
      const templateKeywords = template.metadata?.keywords?.map(k => k.toLowerCase()) || [];
      const keywordOverlap = currentKeywords.some(k => templateKeywords.includes(k));

      if (subjectMatch || keywordOverlap) {
        relevantTemplates.push({
          name: templateInfo.name,
          subject: template.context?.subject || 'Unbekannt',
          template
        });
      }

      // Limit to max 3 templates to keep prompt size reasonable
      if (relevantTemplates.length >= 3) break;
    }

    return relevantTemplates;
  } catch (error) {
    console.error('Error loading community templates:', error);
    return [];
  }
}