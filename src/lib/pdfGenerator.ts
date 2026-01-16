import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generatePDF(state: any) {
  const pdf = new jsPDF();
  let yPos = 20;

  const addSectionHeader = (text: string) => {
    if (yPos > pdf.internal.pageSize.height - 30) {
      pdf.addPage();
      yPos = 20;
    }
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(text, 20, yPos);
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
  };

  const addText = (text: string, indent = 0) => {
    if (!text) return;
    const lines = pdf.splitTextToSize(text, 170 - indent);
    if (yPos + lines.length * 7 > pdf.internal.pageSize.height - 20) {
      pdf.addPage();
      yPos = 20;
    }
    pdf.text(lines, 20 + indent, yPos);
    yPos += lines.length * 7;
  };

  const addListItem = (text: string, level = 0, link?: string) => {
    if (!text) return;
    const indent = level * 5;
    if (yPos > pdf.internal.pageSize.height - 20) {
      pdf.addPage();
      yPos = 20;
    }
    const bullet = level === 0 ? '•' : '-';
    pdf.text(bullet, 20 + indent, yPos);
    
    if (link) {
      // const textWidth = pdf.getTextWidth(text);
      pdf.setTextColor(0, 0, 255);
      pdf.textWithLink(text, 25 + indent, yPos, { url: link });
      pdf.setTextColor(0, 0, 0);
    } else {
      const lines = pdf.splitTextToSize(text, 165 - indent);
      pdf.text(lines, 25 + indent, yPos);
    }
    
    yPos += 7;
  };

  // Page 1: Title and General Information
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(state.metadata.title || 'Didaktisches Template', 20, 40, { maxWidth: 170 });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Autor: ${state.metadata.author || 'Unbekannt'}`, 20, 60);
  pdf.text(`Version: ${state.metadata.version || '1.0'}`, 20, 70);
  
  pdf.setFontSize(12);
  const descLines = pdf.splitTextToSize(state.metadata.description || '', 170);
  pdf.text(descLines, 20, 90);

  if (state.metadata.keywords?.length > 0) {
    yPos = 110;
    addText('Schlüsselwörter: ' + state.metadata.keywords.join(', '));
  }

  // Page 2: Didactic Elements
  pdf.addPage();
  yPos = 20;
  addSectionHeader('Didaktische Grundlagen');

  // Problem
  addText('Problem:', 0);
  addText(state.problem.problem_description, 5);
  if (state.problem.learning_goals?.length > 0) {
    yPos += 5;
    addText('Lernziele:', 5);
    state.problem.learning_goals.forEach((goal: string) => addListItem(goal, 2));
  }
  if (state.problem.didactic_keywords?.length > 0) {
    yPos += 5;
    addText('Didaktische Schlüsselwörter:', 5);
    addText(state.problem.didactic_keywords.join(', '), 10);
  }
  yPos += 10;

  // Context
  addText('Kontext:', 0);
  addText(`Zielgruppe: ${state.context.target_group}`, 5);
  addText(`Fach: ${state.context.subject}`, 5);
  addText(`Bildungsstufe: ${state.context.educational_level}`, 5);
  addText(`Voraussetzungen: ${state.context.prerequisites}`, 5);
  addText(`Zeitrahmen: ${state.context.time_frame}`, 5);
  yPos += 10;

  // Influence Factors
  if (state.influence_factors?.length > 0) {
    addText('Einflussfaktoren:', 0);
    state.influence_factors.forEach((factor: any) => {
      addText(`${factor.factor}:`, 5);
      addText(factor.description, 10);
    });
    yPos += 10;
  }

  // Solution
  addText('Lösung:', 0);
  addText(state.solution.solution_description, 5);
  addText(`Didaktischer Ansatz: ${state.solution.didactic_approach}`, 5);
  yPos += 10;

  // Consequences
  addText('Konsequenzen:', 0);
  if (state.consequences.advantages?.length > 0) {
    addText('Vorteile:', 5);
    state.consequences.advantages.forEach((adv: string) => addListItem(adv, 2));
  }
  if (state.consequences.disadvantages?.length > 0) {
    addText('Nachteile:', 5);
    state.consequences.disadvantages.forEach((dis: string) => addListItem(dis, 2));
  }

  // Implementation Notes
  if (state.implementation_notes?.length > 0) {
    yPos += 10;
    addText('Umsetzungshinweise:', 0);
    state.implementation_notes.forEach((note: any) => addListItem(note.description, 1));
  }

  // Related Patterns
  if (state.related_patterns?.length > 0) {
    yPos += 10;
    addText('Verwandte Muster:', 0);
    addText(state.related_patterns.join(', '), 5);
  }

  // Page 3: Actors
  pdf.addPage();
  yPos = 20;
  addSectionHeader('Akteure');
  
  if (state.actors?.length > 0) {
    state.actors.forEach((actor: any) => {
      addText(`${actor.name || 'Unbenannt'} (${actor.type || 'Unbekannt'})`);
      
      // Demographic data (with null checks)
      if (actor.demographic_data) {
        if (actor.type === 'Gruppe') {
          addText(`Altersbereich: ${actor.demographic_data.age_range || '-'}`, 5);
        } else {
          addText(`Alter: ${actor.demographic_data.age || '-'}`, 5);
        }
      }

      // Education (with null checks)
      if (actor.education) {
        if (actor.education.education_level) addText(`Bildungsstufe: ${actor.education.education_level}`, 5);
        if (actor.education.class_level) addText(`Klassenstufe: ${actor.education.class_level}`, 5);
        if (actor.education.subject_focus) addText(`Fachschwerpunkt: ${actor.education.subject_focus}`, 5);
      }

      yPos += 5;
    });
  } else {
    addText('Keine Akteure definiert.', 5);
  }

  // Page 4: Learning Environments
  pdf.addPage();
  yPos = 20;
  addSectionHeader('Lernumgebungen');

  if (state.environments?.length > 0) {
    state.environments.forEach((env: any) => {
      addText(env.name || 'Unbenannte Umgebung');
      if (env.description) {
        addText(env.description, 5);
      }
      
      // Materials section
      if (env.materials?.length > 0) {
        addText('Lernressourcen:', 5);
        env.materials.forEach((mat: any) => {
          // Get first WLO URL if available, otherwise use access_link
          const wloUrl = mat.wlo_metadata?.[0]?.wwwUrl;
          const link = wloUrl || (mat.access_link?.startsWith('http') ? mat.access_link : undefined);
          const wloCount = mat.wlo_metadata?.length || 0;
          
          addListItem(`${mat.name} (${mat.material_type || 'Material'})${wloCount > 0 ? ` [${wloCount} WLO]` : ''}`, 2, link);
          
          // Add additional WLO resources with links (skip first, already linked above)
          if (Array.isArray(mat.wlo_metadata) && mat.wlo_metadata.length > 1) {
            mat.wlo_metadata.slice(1).forEach((metadata: any) => {
              if (metadata.title && metadata.wwwUrl) {
                addListItem(`→ ${metadata.title}`, 3, metadata.wwwUrl);
              }
            });
          }
        });
      }
      
      // Tools section
      if (env.tools?.length > 0) {
        addText('Werkzeuge:', 5);
        env.tools.forEach((tool: any) => {
          const wloUrl = tool.wlo_metadata?.[0]?.wwwUrl;
          const link = wloUrl || (tool.access_link?.startsWith('http') ? tool.access_link : undefined);
          addListItem(`${tool.name} (${tool.tool_type || 'Werkzeug'})`, 2, link);
        });
      }
      
      // Services section
      if (env.services?.length > 0) {
        addText('Dienste:', 5);
        env.services.forEach((service: any) => {
          const link = service.access_link?.startsWith('http') ? service.access_link : undefined;
          addListItem(`${service.name} (${service.service_type || 'Dienst'})`, 2, link);
        });
      }
      
      yPos += 10;
    });
  } else {
    addText('Keine Lernumgebungen definiert.', 5);
  }

  // Page 5: Course Flow
  pdf.addPage();
  yPos = 20;
  addSectionHeader('Unterrichtsablauf');

  const sequences = state.solution?.didactic_template?.learning_sequences || [];
  if (!sequences.length) {
    addText('Keine Lernsequenzen verfügbar.');
    pdf.save(`${state.metadata.title || 'didaktisches-template'}.pdf`);
    return;
  }

  // Create table headers
  const actors = state.actors || [];
  const headers = [
    'Aktivitätsdetails',
    ...actors.map((actor: any) => actor.name || 'Unbenannter Akteur') 
  ];

  // Prepare table data
  const tableData: any[][] = [];

  sequences.forEach((sequence: any) => {
    // Add sequence header
    tableData.push([{
      content: `${sequence.sequence_name || sequence.sequence_id}\nZeit: ${sequence.time_frame || ''}`,
      colSpan: headers.length,
      styles: { fillColor: [240, 247, 255] }
    }]);

    (sequence.phases || []).forEach((phase: any) => {
      // Add phase header
      tableData.push([{
        content: `${phase.phase_name || phase.phase_id}\nZeit: ${phase.time_frame || ''}`,
        colSpan: headers.length,
        styles: { fillColor: [240, 250, 245] }
      }]);

      // Add activities
      (phase.activities || []).forEach((activity: any) => {
        const environments = state.environments || [];
        
        // Get learning environment for this activity
        const activityEnvNames = new Set<string>();
        activity.roles?.forEach((role: any) => {
          const env = environments.find((e: any) => e.id === role.learning_environment?.environment_id);
          if (env) activityEnvNames.add(env.name);
        });
        
        // Activity details with environment
        let activityText = `${activity.name || activity.activity_id}\n${activity.description || ''}\nDauer: ${activity.duration || 0} min`;
        if (activityEnvNames.size > 0) {
          activityText += `\n\n[Umgebung] ${Array.from(activityEnvNames).join(', ')}`;
        }

        // Prepare actor columns
        const actorColumns = actors.map((actor: any) => {
          const actorRoles = activity.roles?.filter((role: any) => role.actor_id === actor.id) || [];
          if (actorRoles.length === 0) return '';

          return actorRoles.map((role: any) => {
            let content = `${role.role_name || 'Rolle'}\n${role.task_description || ''}`;

            if (role.learning_environment) {
              const env = environments.find((e: any) => e.id === role.learning_environment?.environment_id);
              if (env) {
                // Add materials
                const materials = role.learning_environment.selected_materials
                  ?.map((id: string) => env.materials?.find((m: any) => m.id === id))
                  .filter(Boolean) || [];
                if (materials.length) {
                  content += '\n\nMaterialien:';
                  materials.forEach((m: any) => {
                    const wloCount = m.wlo_metadata?.length || 0;
                    content += `\n- ${m.name}${wloCount > 0 ? ` (${wloCount})` : ''}`;
                  });
                }

                // Add tools
                const tools = role.learning_environment.selected_tools
                  ?.map((id: string) => env.tools?.find((t: any) => t.id === id))
                  .filter(Boolean) || [];
                if (tools.length) {
                  content += '\n\nWerkzeuge:';
                  tools.forEach((t: any) => {
                    content += `\n- ${t.name}`;
                  });
                }
              }
            }

            return content;
          }).join('\n\n---\n\n');
        });

        tableData.push([activityText, ...actorColumns]);
      });
    });
  });

  // Add table to PDF using autoTable
  autoTable(pdf, {
    head: [headers],
    body: tableData,
    startY: yPos + 10,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: 'linebreak',
      lineColor: [220, 220, 220],
      lineWidth: 0.5,
      valign: 'top'
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [60, 60, 60],
      fontStyle: 'bold',
      fontSize: 10
    },
    columnStyles: {
      0: { cellWidth: 55 },  // Activity details - fixed width
    },
    didDrawPage: (data: any) => {
      if (data.pageCount > 1) {
        pdf.setFontSize(10);
        pdf.text('Unterrichtsablauf (Fortsetzung)', 20, 15);
      }
      yPos = data.cursor?.y ? data.cursor.y + 10 : yPos;
    }
  });

  // Page: WLO Content Appendix
  pdf.addPage();
  yPos = 20;
  addSectionHeader('Anhang: WLO Inhalte');
  
  addText('Alle verlinkten Bildungsressourcen aus WirLernenOnline:', 0);
  yPos += 5;
  
  let wloIndex = 1;
  const environments = state.environments || [];
  
  environments.forEach((env: any) => {
    const hasWloContent = env.materials?.some((m: any) => m.wlo_metadata?.length > 0) ||
                          env.tools?.some((t: any) => t.wlo_metadata?.length > 0);
    
    if (!hasWloContent) return;
    
    addText(`${env.name}:`, 0);
    yPos += 3;
    
    // Materials with WLO
    env.materials?.forEach((mat: any) => {
      if (mat.wlo_metadata?.length > 0) {
        addText(`${mat.name}:`, 5);
        mat.wlo_metadata.forEach((wlo: any) => {
          if (wlo.title) {
            addText(`[${wloIndex}] ${wlo.title}`, 10);
            if (wlo.wwwUrl) {
              addText(`URL: ${wlo.wwwUrl}`, 15);
            }
            if (wlo.resourceType) {
              addText(`Typ: ${wlo.resourceType}`, 15);
            }
            wloIndex++;
            yPos += 2;
          }
        });
      }
    });
    
    // Tools with WLO
    env.tools?.forEach((tool: any) => {
      if (tool.wlo_metadata?.length > 0) {
        addText(`${tool.name}:`, 5);
        tool.wlo_metadata.forEach((wlo: any) => {
          if (wlo.title) {
            addText(`[${wloIndex}] ${wlo.title}`, 10);
            if (wlo.wwwUrl) {
              addText(`URL: ${wlo.wwwUrl}`, 15);
            }
            wloIndex++;
            yPos += 2;
          }
        });
      }
    });
    
    yPos += 5;
  });
  
  if (wloIndex === 1) {
    addText('Keine WLO-Inhalte verknüpft.', 5);
  }

  // Save the PDF
  pdf.save(`${state.metadata.title || 'didaktisches-template'}.pdf`);
}