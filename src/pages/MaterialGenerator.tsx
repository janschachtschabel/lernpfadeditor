import { useState, useEffect } from 'react';
import { useTemplateStore } from '../store/templateStore';
import { DocumentTextIcon, ArrowDownTrayIcon, SparklesIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';

const AI_MODELS = [
  { id: 'gpt-5-mini', name: 'GPT-5 Mini (schnell)' },
  { id: 'gpt-5.2', name: 'GPT-5.2 (detailliert)' }
];

interface MaterialType {
  id: string;
  name: string;
  description: string;
  icon: string;
  suitableFor?: string[]; // Phase types or activity keywords this material is suited for
}

const MATERIAL_TYPES: MaterialType[] = [
  { id: 'auto', name: 'Automatisch', description: 'KI wählt passenden Materialtyp', icon: '🤖', suitableFor: [] },
  { id: 'worksheet', name: 'Arbeitsblatt', description: 'Übungsaufgaben und Arbeitsaufträge', icon: '📝', suitableFor: ['übung', 'erarbeitung', 'anwendung', 'aufgabe'] },
  { id: 'info-sheet', name: 'Infoblatt', description: 'Zusammenfassung wichtiger Informationen', icon: '📄', suitableFor: ['einführung', 'information', 'input', 'theorie'] },
  { id: 'presentation', name: 'Präsentation', description: 'Folien für Vortrag oder Lehrervortrag', icon: '📊', suitableFor: ['einführung', 'vortrag', 'präsentation', 'input'] },
  { id: 'quiz', name: 'Quiz/Test', description: 'Verständnisfragen und Lernzielkontrolle', icon: '❓', suitableFor: ['kontrolle', 'test', 'prüfung', 'reflexion', 'abschluss'] },
  { id: 'checklist', name: 'Checkliste', description: 'Schritt-für-Schritt Anleitung', icon: '✅', suitableFor: ['anleitung', 'projekt', 'experiment', 'praktisch'] },
  { id: 'glossary', name: 'Glossar', description: 'Begriffserklärungen und Definitionen', icon: '📖', suitableFor: ['einführung', 'begriffe', 'vokabeln', 'fachbegriffe'] },
  { id: 'mindmap', name: 'Strukturübersicht', description: 'Themenübersicht als Text-Mindmap', icon: '🗺️', suitableFor: ['zusammenfassung', 'überblick', 'struktur', 'abschluss'] },
  { id: 'exercise', name: 'Übungsaufgaben', description: 'Differenzierte Aufgaben mit Lösungen', icon: '✏️', suitableFor: ['übung', 'vertiefung', 'transfer', 'anwendung'] },
  { id: 'story', name: 'Lerngeschichte', description: 'Narrativer Zugang zum Thema', icon: '📚', suitableFor: ['einstieg', 'motivation', 'kontext', 'einführung'] },
  { id: 'experiment', name: 'Versuchsanleitung', description: 'Anleitung für Experimente/Versuche', icon: '🔬', suitableFor: ['experiment', 'versuch', 'praktisch', 'hands-on'] },
  { id: 'discussion', name: 'Diskussionskarten', description: 'Impulse für Gespräche und Debatten', icon: '💬', suitableFor: ['diskussion', 'austausch', 'reflexion', 'meinung'] },
  { id: 'roleplay', name: 'Rollenspielkarten', description: 'Szenarien und Rollenbeschreibungen', icon: '🎭', suitableFor: ['rollenspiel', 'simulation', 'szenario', 'dialog'] },
];

export function MaterialGenerator() {
  const state = useTemplateStore();
  
  // Settings
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-5-mini');
  
  // Selection state
  const [selectedSequence, setSelectedSequence] = useState<string>('');
  const [selectedPhase, setSelectedPhase] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedActor, setSelectedActor] = useState<string>('');
  const [selectedMaterialType, setSelectedMaterialType] = useState<string>('auto');
  const [customInstructions, setCustomInstructions] = useState('');
  
  // Generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [status, setStatus] = useState<string[]>([]);

  // Load settings from localStorage
  useEffect(() => {
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    const storedApiKey = localStorage.getItem('openai_api_key') || '';
    const storedModel = localStorage.getItem('openai_model') || 'gpt-5-mini';
    setApiKey(envApiKey || storedApiKey);
    setModel(storedModel);
  }, []);

  // Get sequences from template
  const sequences = state.solution?.didactic_template?.learning_sequences || [];
  
  // Get phases for selected sequence
  const getPhases = () => {
    const sequence = sequences.find(s => s.sequence_id === selectedSequence);
    return sequence?.phases || [];
  };
  
  // Get activities for selected phase
  const getActivities = () => {
    const phases = getPhases();
    const phase = phases.find(p => p.phase_id === selectedPhase);
    return phase?.activities || [];
  };

  // Get actor info
  const getActorInfo = (actorId: string) => {
    return state.actors.find(a => a.id === actorId);
  };

  // Auto-detect best material type based on activity/phase context
  const detectBestMaterialType = (): MaterialType => {
    const phase = getPhases().find(p => p.phase_id === selectedPhase);
    const activity = getActivities().find(a => a.activity_id === selectedActivity);
    
    // Combine all text to search for keywords
    const searchText = [
      phase?.phase_name || '',
      activity?.name || '',
      activity?.description || '',
      activity?.goal || ''
    ].join(' ').toLowerCase();

    // Score each material type based on keyword matches
    const scores = MATERIAL_TYPES
      .filter(m => m.id !== 'auto')
      .map(materialType => {
        const matchCount = (materialType.suitableFor || [])
          .filter(keyword => searchText.includes(keyword.toLowerCase()))
          .length;
        return { materialType, score: matchCount };
      });

    // Sort by score and get the best match
    scores.sort((a, b) => b.score - a.score);
    
    // If no good match found, default to worksheet
    if (scores[0].score === 0) {
      return MATERIAL_TYPES.find(m => m.id === 'worksheet')!;
    }
    
    return scores[0].materialType;
  };

  // Get the effective material type (resolves 'auto' to actual type)
  const getEffectiveMaterialType = (): MaterialType => {
    if (selectedMaterialType === 'auto') {
      return detectBestMaterialType();
    }
    return MATERIAL_TYPES.find(m => m.id === selectedMaterialType) || MATERIAL_TYPES[1];
  };

  // Build comprehensive prompt
  const buildPrompt = () => {
    const materialType = getEffectiveMaterialType();
    const sequence = sequences.find(s => s.sequence_id === selectedSequence);
    const phase = getPhases().find(p => p.phase_id === selectedPhase);
    const activity = getActivities().find(a => a.activity_id === selectedActivity);
    const actor = getActorInfo(selectedActor);

    let prompt = `# Kontext: Unterrichtsplanung

## Allgemeine Informationen
- **Thema:** ${state.metadata?.title || 'Nicht angegeben'}
- **Fach:** ${state.context?.subject || 'Nicht angegeben'}
- **Bildungsstufe:** ${state.context?.educational_level || ''}
- **Zeitrahmen:** ${state.context?.time_frame || 'Nicht angegeben'}

## Lernziele
${state.problem?.learning_goals?.map(g => `- ${g}`).join('\n') || 'Keine Lernziele definiert'}

## Aktuelle Position im Unterricht
- **Lernsequenz:** ${sequence?.sequence_name || 'Nicht ausgewählt'}
- **Phase:** ${phase?.phase_name || 'Nicht ausgewählt'}
- **Aktivität:** ${activity?.name || 'Nicht ausgewählt'}
${activity?.description ? `- **Beschreibung:** ${activity.description}` : ''}
${activity?.duration ? `- **Dauer:** ${activity.duration} Minuten` : ''}

## Zielgruppe
- **Akteur:** ${actor?.name || 'Nicht ausgewählt'}
- **Typ:** ${actor?.type || ''}
${actor?.education?.class_level ? `- **Klassenstufe:** ${actor.education.class_level}` : ''}
${actor?.social_structure?.group_size ? `- **Gruppengröße:** ${actor.social_structure.group_size}` : ''}
`;

    // Add differentiation info if available
    if (actor?.differentiation_options && actor.differentiation_options.length > 0) {
      prompt += `\n## Binnendifferenzierung\n`;
      actor.differentiation_options.forEach(diff => {
        prompt += `### ${diff.label}\n`;
        prompt += `${diff.description}\n`;
        if (diff.hints && diff.hints.length > 0) {
          prompt += `Hinweise:\n${diff.hints.map(h => `- ${h}`).join('\n')}\n`;
        }
      });
    }

    // Add special needs if available
    if (actor?.learning_requirements?.special_needs && actor.learning_requirements.special_needs.length > 0) {
      prompt += `\n## Besondere Bedürfnisse\n`;
      prompt += actor.learning_requirements.special_needs.map(n => `- ${n}`).join('\n');
    }

    prompt += `\n\n# Aufgabe
Erstelle ein **${materialType?.name}** (${materialType?.description}) für die oben beschriebene Unterrichtssituation.

## Anforderungen
- Das Material soll genau zur beschriebenen Aktivität und Phase passen
- Es soll für die Zielgruppe (${actor?.name || 'Lernende'}) angemessen sein
- Berücksichtige eventuelle Differenzierungsbedarfe
- Formatiere das Material in Markdown mit:
  - Überschriften für Abschnitte
  - Nummerierte Listen für Aufgaben
  - Tabellen wo sinnvoll
  - Fettdruck für wichtige Begriffe
`;

    if (customInstructions) {
      prompt += `\n## Zusätzliche Anweisungen\n${customInstructions}`;
    }

    prompt += `\n\nErstelle jetzt das ${materialType?.name}:`;

    return prompt;
  };

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, message]);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Bitte API-Key in den Einstellungen hinterlegen');
      return;
    }

    if (!selectedSequence || !selectedPhase || !selectedActivity || !selectedActor) {
      setError('Bitte wählen Sie Sequenz, Phase, Aktivität und Akteur aus');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus([]);
    setGeneratedContent('');

    try {
      const effectiveType = getEffectiveMaterialType();
      if (selectedMaterialType === 'auto') {
        addStatus(`🤖 Automatisch erkannt: ${effectiveType.icon} ${effectiveType.name}`);
      }
      addStatus('🔧 Erstelle Prompt...');
      const prompt = buildPrompt();
      
      addStatus(`🚀 Generiere ${effectiveType.name} mit KI...`);
      
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          input: [
            { 
              role: 'system', 
              content: 'Du bist ein erfahrener Lehrer und Didaktiker. Erstelle hochwertige, praxistaugliche Unterrichtsmaterialien. Formatiere alles in Markdown.' 
            },
            { role: 'user', content: prompt }
          ],
          max_output_tokens: 4000,
          reasoning: { effort: 'medium' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Fehler: ${response.status}`);
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
        throw new Error('Keine Antwort vom KI-Modell erhalten');
      }

      setGeneratedContent(outputText);
      addStatus('✅ Material erfolgreich generiert!');
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(message);
      addStatus(`❌ Fehler: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown to HTML converter
  const renderMarkdown = (markdown: string) => {
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900 border-b pb-2">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="my-3">')
      .replace(/\n/g, '<br/>');
    
    // Wrap in paragraph
    html = `<p class="my-3">${html}</p>`;
    
    // Simple table support
    html = html.replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      const isHeader = match.includes('---');
      if (isHeader) return '';
      return `<tr>${cells.map(c => `<td class="border px-3 py-2">${c.trim()}</td>`).join('')}</tr>`;
    });

    return html;
  };

  // Clean text for PDF (remove emojis, markdown formatting, and special unicode)
  const cleanTextForPDF = (text: string): string => {
    return text
      // Remove markdown bold/italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      // Remove emojis and special unicode characters
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols Extended-A
      .replace(/[\u{231A}-\u{231B}]/gu, '')   // Watch/Hourglass
      .replace(/[\u{23E9}-\u{23F3}]/gu, '')   // Media symbols
      .replace(/[\u{23F8}-\u{23FA}]/gu, '')   // Media symbols
      .replace(/[\u{25AA}-\u{25AB}]/gu, '')   // Squares
      .replace(/[\u{25B6}]/gu, '')            // Play button
      .replace(/[\u{25C0}]/gu, '')            // Reverse button
      .replace(/[\u{25FB}-\u{25FE}]/gu, '')   // Squares
      .replace(/[\u{2934}-\u{2935}]/gu, '')   // Arrows
      .replace(/[\u{2B05}-\u{2B07}]/gu, '')   // Arrows
      .replace(/[\u{2B1B}-\u{2B1C}]/gu, '')   // Squares
      .replace(/[\u{2B50}]/gu, '')            // Star
      .replace(/[\u{2B55}]/gu, '')            // Circle
      .replace(/[\u{3030}]/gu, '')            // Wavy dash
      .replace(/[\u{303D}]/gu, '')            // Part alternation mark
      .replace(/[\u{3297}]/gu, '')            // Circled Ideograph
      .replace(/[\u{3299}]/gu, '')            // Circled Ideograph
      .trim();
  };

  // Parse markdown to structured content for PDF
  const parseMarkdownForPDF = (markdown: string): Array<{type: string, content: string, level?: number}> => {
    const lines = markdown.split('\n');
    const parsed: Array<{type: string, content: string, level?: number}> = [];
    let inTable = false;
    let tableRows: string[][] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) {
        parsed.push({ type: 'space', content: '' });
        continue;
      }

      // Table separator line - skip
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        continue;
      }

      // Table row
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        // End of table
        if (tableRows.length > 0) {
          parsed.push({ type: 'table', content: JSON.stringify(tableRows) });
        }
        inTable = false;
        tableRows = [];
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        parsed.push({ type: 'h3', content: cleanTextForPDF(trimmed.slice(4)) });
      } else if (trimmed.startsWith('## ')) {
        parsed.push({ type: 'h2', content: cleanTextForPDF(trimmed.slice(3)) });
      } else if (trimmed.startsWith('# ')) {
        parsed.push({ type: 'h1', content: cleanTextForPDF(trimmed.slice(2)) });
      }
      // Numbered list
      else if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, '');
        parsed.push({ type: 'numbered', content: cleanTextForPDF(content) });
      }
      // Bullet list
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        parsed.push({ type: 'bullet', content: cleanTextForPDF(trimmed.slice(2)) });
      }
      // Horizontal rule
      else if (/^[-*_]{3,}$/.test(trimmed)) {
        parsed.push({ type: 'hr', content: '' });
      }
      // Regular paragraph
      else {
        // Remove markdown formatting
        const clean = cleanTextForPDF(trimmed.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, ''));
        parsed.push({ type: 'text', content: clean });
      }
    }

    // Handle remaining table
    if (inTable && tableRows.length > 0) {
      parsed.push({ type: 'table', content: JSON.stringify(tableRows) });
    }

    return parsed;
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (!generatedContent) return;

    const doc = new jsPDF();
    const materialType = getEffectiveMaterialType();
    const actor = getActorInfo(selectedActor);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF(materialType?.name || 'Lernmaterial'), margin, 25);
    
    // Subtitle
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Fuer: ${cleanTextForPDF(actor?.name || 'Lernende')} | ${cleanTextForPDF(state.metadata?.title || 'Unterricht')}`, margin, 33);
    
    // Separator line
    doc.setDrawColor(200);
    doc.line(margin, 38, pageWidth - margin, 38);
    
    let y = 48;
    let listCounter = 0;
    
    const parsed = parseMarkdownForPDF(generatedContent);
    
    const addNewPageIfNeeded = (requiredSpace: number) => {
      if (y + requiredSpace > 280) {
        doc.addPage();
        y = 20;
      }
    };

    for (const item of parsed) {
      doc.setTextColor(0);
      
      switch (item.type) {
        case 'h1':
          addNewPageIfNeeded(15);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          y += 4;
          doc.text(item.content, margin, y);
          y += 8;
          doc.setDrawColor(180);
          doc.line(margin, y, pageWidth - margin, y);
          y += 6;
          break;
          
        case 'h2':
          addNewPageIfNeeded(12);
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          y += 3;
          doc.text(item.content, margin, y);
          y += 7;
          break;
          
        case 'h3':
          addNewPageIfNeeded(10);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          y += 2;
          doc.text(item.content, margin, y);
          y += 6;
          break;
          
        case 'numbered':
          listCounter++;
          addNewPageIfNeeded(8);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const numLines = doc.splitTextToSize(`${listCounter}. ${item.content}`, contentWidth - 10);
          numLines.forEach((line: string, idx: number) => {
            addNewPageIfNeeded(6);
            doc.text(line, margin + (idx === 0 ? 0 : 8), y);
            y += 5;
          });
          y += 1;
          break;
          
        case 'bullet':
          listCounter = 0;
          addNewPageIfNeeded(8);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const bulletLines = doc.splitTextToSize(item.content, contentWidth - 10);
          bulletLines.forEach((line: string, idx: number) => {
            addNewPageIfNeeded(6);
            if (idx === 0) {
              doc.text('•', margin, y);
            }
            doc.text(line, margin + 6, y);
            y += 5;
          });
          y += 1;
          break;
          
        case 'table':
          listCounter = 0;
          const rows = JSON.parse(item.content) as string[][];
          if (rows.length > 0) {
            addNewPageIfNeeded(rows.length * 8 + 5);
            doc.setFontSize(10);
            const colCount = rows[0].length;
            const colWidth = contentWidth / colCount;
            
            rows.forEach((row, rowIdx) => {
              addNewPageIfNeeded(8);
              doc.setFont('helvetica', rowIdx === 0 ? 'bold' : 'normal');
              row.forEach((cell, colIdx) => {
                const cellText = doc.splitTextToSize(cleanTextForPDF(cell), colWidth - 4);
                doc.text(cellText[0] || '', margin + colIdx * colWidth + 2, y);
              });
              y += 6;
              if (rowIdx === 0) {
                doc.setDrawColor(150);
                doc.line(margin, y - 2, pageWidth - margin, y - 2);
              }
            });
            y += 3;
          }
          break;
          
        case 'hr':
          listCounter = 0;
          addNewPageIfNeeded(8);
          y += 2;
          doc.setDrawColor(200);
          doc.line(margin, y, pageWidth - margin, y);
          y += 6;
          break;
          
        case 'space':
          listCounter = 0;
          y += 3;
          break;
          
        case 'text':
        default:
          listCounter = 0;
          if (item.content) {
            addNewPageIfNeeded(8);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const textLines = doc.splitTextToSize(item.content, contentWidth);
            textLines.forEach((line: string) => {
              addNewPageIfNeeded(6);
              doc.text(line, margin, y);
              y += 5;
            });
            y += 2;
          }
          break;
      }
    }
    
    doc.save(`${materialType?.id || 'material'}_${Date.now()}.pdf`);
  };

  const canGenerate = selectedSequence && selectedPhase && selectedActivity && selectedActor && apiKey;

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <DocumentTextIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material Generator</h1>
          <p className="text-sm text-gray-500">KI-gestützte Erstellung von Unterrichtsmaterialien</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-emerald-800">KI-Materialerstellung</h3>
            <p className="text-sm text-emerald-700 mt-1">
              Generieren Sie passgenaue Lernmaterialien basierend auf Ihrem Unterrichtsplan. 
              Wählen Sie eine Aktivität und einen Akteur aus, und die KI erstellt ein individuell 
              angepasstes Material mit Berücksichtigung von Binnendifferenzierung.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Kontext auswählen</h2>
            
            {/* Sequence Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lernsequenz</label>
              <select
                value={selectedSequence}
                onChange={(e) => {
                  setSelectedSequence(e.target.value);
                  setSelectedPhase('');
                  setSelectedActivity('');
                }}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="">Bitte wählen...</option>
                {sequences.map(seq => (
                  <option key={seq.sequence_id} value={seq.sequence_id}>
                    {seq.sequence_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Phase Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
              <select
                value={selectedPhase}
                onChange={(e) => {
                  setSelectedPhase(e.target.value);
                  setSelectedActivity('');
                }}
                disabled={!selectedSequence}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-100"
              >
                <option value="">Bitte wählen...</option>
                {getPhases().map(phase => (
                  <option key={phase.phase_id} value={phase.phase_id}>
                    {phase.phase_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Activity Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Aktivität</label>
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                disabled={!selectedPhase}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-100"
              >
                <option value="">Bitte wählen...</option>
                {getActivities().map(activity => (
                  <option key={activity.activity_id} value={activity.activity_id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Actor Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Akteur (Zielgruppe)</label>
              <select
                value={selectedActor}
                onChange={(e) => setSelectedActor(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="">Bitte wählen...</option>
                {state.actors.map(actor => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name} ({actor.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Material Type Selection */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Materialtyp</h2>
            
            {/* Auto-detection indicator */}
            {selectedMaterialType === 'auto' && selectedActivity && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <span>🤖</span>
                  <span>Erkannt: <strong>{getEffectiveMaterialType().icon} {getEffectiveMaterialType().name}</strong></span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {MATERIAL_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedMaterialType(type.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedMaterialType === type.id
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500'
                      : type.id === 'auto' 
                        ? 'border-blue-200 bg-blue-50/50 hover:border-blue-400 hover:bg-blue-50'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{type.name}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Zusätzliche Anweisungen</h2>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="z.B. 'Füge Bilder-Platzhalter ein' oder 'Verwende einfache Sprache'"
              rows={3}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 ${
              canGenerate && !loading
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generiere...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                Material generieren
              </>
            )}
          </button>

          {/* Status Messages */}
          {status.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              {status.map((msg, i) => (
                <div key={i} className="text-gray-600">{msg}</div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">Vorschau</h2>
              {generatedContent && (
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Als PDF exportieren
                </button>
              )}
            </div>
            
            <div className="p-6 min-h-[600px]">
              {generatedContent ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(generatedContent) }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <DocumentTextIcon className="w-16 h-16 mb-4" />
                  <p className="text-center">
                    Wählen Sie Kontext und Materialtyp aus,<br />
                    um ein Lernmaterial zu generieren.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialGenerator;
