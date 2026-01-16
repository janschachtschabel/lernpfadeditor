// Export utilities for different formats

interface TemplateData {
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
  influence_factors: Array<{ factor: string; description: string }>;
  solution: {
    solution_description: string;
    didactic_approach: string;
    didactic_template: {
      learning_sequences: any[];
    };
  };
  consequences: {
    advantages: string[];
    disadvantages: string[];
  };
  implementation_notes: Array<{ note_id: string; description: string }>;
  related_patterns: string[];
  actors: any[];
  environments: any[];
}

// Export to Markdown format
export function exportToMarkdown(template: TemplateData): string {
  const lines: string[] = [];
  
  // Title and metadata
  lines.push(`# ${template.metadata.title || 'Lernpfad'}`);
  lines.push('');
  if (template.metadata.description) {
    lines.push(`> ${template.metadata.description}`);
    lines.push('');
  }
  
  // Metadata table
  lines.push('## Metadaten');
  lines.push('');
  lines.push('| Eigenschaft | Wert |');
  lines.push('|-------------|------|');
  lines.push(`| Autor | ${template.metadata.author || '-'} |`);
  lines.push(`| Version | ${template.metadata.version || '1.0'} |`);
  lines.push(`| Fach | ${template.context.subject || '-'} |`);
  lines.push(`| Zielgruppe | ${template.context.target_group || '-'} |`);
  lines.push(`| Bildungsstufe | ${template.context.educational_level || '-'} |`);
  lines.push(`| Zeitrahmen | ${template.context.time_frame || '-'} |`);
  if (template.metadata.keywords?.length > 0) {
    lines.push(`| Schlagwörter | ${template.metadata.keywords.join(', ')} |`);
  }
  lines.push('');
  
  // Problem description
  if (template.problem.problem_description) {
    lines.push('## Problemstellung');
    lines.push('');
    lines.push(template.problem.problem_description);
    lines.push('');
  }
  
  // Learning goals
  if (template.problem.learning_goals?.length > 0) {
    lines.push('## Lernziele');
    lines.push('');
    template.problem.learning_goals.forEach((goal, i) => {
      lines.push(`${i + 1}. ${goal}`);
    });
    lines.push('');
  }
  
  // Prerequisites
  if (template.context.prerequisites) {
    lines.push('## Voraussetzungen');
    lines.push('');
    lines.push(template.context.prerequisites);
    lines.push('');
  }
  
  // Actors
  if (template.actors?.length > 0) {
    lines.push('## Akteure');
    lines.push('');
    template.actors.forEach(actor => {
      lines.push(`### ${actor.name}`);
      lines.push('');
      lines.push(`- **Typ:** ${actor.type}`);
      if (actor.education?.education_level) {
        lines.push(`- **Bildungsstufe:** ${actor.education.education_level}`);
      }
      if (actor.education?.subject_focus) {
        lines.push(`- **Fachschwerpunkt:** ${actor.education.subject_focus}`);
      }
      if (actor.social_form) {
        lines.push(`- **Sozialform:** ${actor.social_form}`);
      }
      lines.push('');
    });
  }
  
  // Learning Sequences
  if (template.solution.didactic_template.learning_sequences?.length > 0) {
    lines.push('## Lernsequenzen');
    lines.push('');
    
    template.solution.didactic_template.learning_sequences.forEach((seq, seqIndex) => {
      lines.push(`### ${seqIndex + 1}. ${seq.sequence_name}`);
      lines.push('');
      if (seq.time_frame) lines.push(`**Zeitrahmen:** ${seq.time_frame}`);
      if (seq.learning_goal) lines.push(`**Lernziel:** ${seq.learning_goal}`);
      lines.push('');
      
      // Phases
      if (seq.phases?.length > 0) {
        seq.phases.forEach((phase: any, phaseIndex: number) => {
          lines.push(`#### Phase ${phaseIndex + 1}: ${phase.phase_name}`);
          lines.push('');
          if (phase.time_frame) lines.push(`- **Zeit:** ${phase.time_frame}`);
          if (phase.learning_goal) lines.push(`- **Ziel:** ${phase.learning_goal}`);
          lines.push('');
          
          // Activities
          if (phase.activities?.length > 0) {
            lines.push('**Aktivitäten:**');
            lines.push('');
            phase.activities.forEach((activity: any, actIndex: number) => {
              lines.push(`${actIndex + 1}. **${activity.name}** (${activity.duration} Min.)`);
              if (activity.description) {
                lines.push(`   - ${activity.description}`);
              }
              if (activity.goal) {
                lines.push(`   - *Ziel:* ${activity.goal}`);
              }
              
              // Roles
              if (activity.roles?.length > 0) {
                activity.roles.forEach((role: any) => {
                  lines.push(`   - *${role.role_name}:* ${role.task_description}`);
                });
              }
            });
            lines.push('');
          }
        });
      }
    });
  }
  
  // Learning Environments
  if (template.environments?.length > 0) {
    lines.push('## Lernumgebungen');
    lines.push('');
    
    template.environments.forEach(env => {
      lines.push(`### ${env.name}`);
      lines.push('');
      if (env.description) {
        lines.push(env.description);
        lines.push('');
      }
      
      // Materials
      if (env.materials?.length > 0) {
        lines.push('**Materialien:**');
        lines.push('');
        env.materials.forEach((mat: any) => {
          const url = mat.wlo_metadata?.[0]?.wwwUrl || mat.access_link;
          if (url) {
            lines.push(`- [${mat.name}](${url}) (${mat.material_type})`);
          } else {
            lines.push(`- ${mat.name} (${mat.material_type})`);
          }
          
          // WLO metadata
          if (mat.wlo_metadata?.length > 0) {
            mat.wlo_metadata.forEach((wlo: any) => {
              if (wlo.wwwUrl) {
                lines.push(`  - [${wlo.title}](${wlo.wwwUrl})`);
              }
            });
          }
        });
        lines.push('');
      }
      
      // Tools
      if (env.tools?.length > 0) {
        lines.push('**Werkzeuge:**');
        lines.push('');
        env.tools.forEach((tool: any) => {
          const url = tool.wlo_metadata?.[0]?.wwwUrl || tool.access_link;
          if (url) {
            lines.push(`- [${tool.name}](${url}) (${tool.tool_type})`);
          } else {
            lines.push(`- ${tool.name} (${tool.tool_type})`);
          }
        });
        lines.push('');
      }
      
      // Services
      if (env.services?.length > 0) {
        lines.push('**Dienste:**');
        lines.push('');
        env.services.forEach((service: any) => {
          const url = service.wlo_metadata?.[0]?.wwwUrl || service.access_link;
          if (url) {
            lines.push(`- [${service.name}](${url}) (${service.service_type})`);
          } else {
            lines.push(`- ${service.name} (${service.service_type})`);
          }
        });
        lines.push('');
      }
    });
  }
  
  // Advantages and Disadvantages
  if (template.consequences.advantages?.length > 0 || template.consequences.disadvantages?.length > 0) {
    lines.push('## Konsequenzen');
    lines.push('');
    
    if (template.consequences.advantages?.length > 0) {
      lines.push('### Vorteile');
      lines.push('');
      template.consequences.advantages.forEach(adv => {
        lines.push(`- ✅ ${adv}`);
      });
      lines.push('');
    }
    
    if (template.consequences.disadvantages?.length > 0) {
      lines.push('### Nachteile');
      lines.push('');
      template.consequences.disadvantages.forEach(dis => {
        lines.push(`- ⚠️ ${dis}`);
      });
      lines.push('');
    }
  }
  
  // Footer
  lines.push('---');
  lines.push(`*Erstellt mit dem Lernpfad-Editor • ${new Date().toLocaleDateString('de-DE')}*`);
  
  return lines.join('\n');
}

// Export to HTML format
export function exportToHTML(template: TemplateData): string {
  const md = exportToMarkdown(template);
  
  // Simple markdown to HTML conversion
  let html = md
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Tables
    .replace(/\|([^|]+)\|([^|]+)\|/g, (match, col1, col2) => {
      if (col1.trim().startsWith('-')) return '';
      return `<tr><td>${col1.trim()}</td><td>${col2.trim()}</td></tr>`;
    })
    // Lists
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // Wrap in HTML document
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.metadata.title || 'Lernpfad'}</title>
  <style>
    :root {
      --primary: #3b82f6;
      --primary-dark: #1d4ed8;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-600: #4b5563;
      --gray-800: #1f2937;
      --green-100: #dcfce7;
      --green-600: #16a34a;
      --amber-100: #fef3c7;
      --amber-600: #d97706;
    }
    
    * { box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      color: var(--gray-800);
      background: var(--gray-50);
    }
    
    h1 {
      color: var(--primary-dark);
      border-bottom: 3px solid var(--primary);
      padding-bottom: 0.5rem;
    }
    
    h2 {
      color: var(--gray-800);
      margin-top: 2rem;
      border-left: 4px solid var(--primary);
      padding-left: 1rem;
    }
    
    h3 {
      color: var(--gray-600);
      margin-top: 1.5rem;
    }
    
    h4 {
      color: var(--gray-600);
      font-size: 1rem;
    }
    
    blockquote {
      background: var(--gray-100);
      border-left: 4px solid var(--primary);
      margin: 1rem 0;
      padding: 1rem;
      font-style: italic;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    th, td {
      border: 1px solid var(--gray-200);
      padding: 0.75rem;
      text-align: left;
    }
    
    th {
      background: var(--gray-100);
      font-weight: 600;
    }
    
    ul, ol {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    
    li {
      margin: 0.5rem 0;
    }
    
    a {
      color: var(--primary);
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    hr {
      border: none;
      border-top: 1px solid var(--gray-200);
      margin: 2rem 0;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1rem 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .success { background: var(--green-100); color: var(--green-600); }
    .warning { background: var(--amber-100); color: var(--amber-600); }
    
    @media print {
      body { background: white; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

// Download file utility
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
