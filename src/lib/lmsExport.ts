/**
 * LMS Export Formats for Moodle and ILIAS
 * 
 * Exports:
 * - Moodle MBZ (ZIP backup format)
 * - IMS Common Cartridge (.imscc)
 */
import JSZip from 'jszip';

export interface LMSExportData {
  metadata: any;
  context: any;
  problem: any;
  solution: any;
  actors: any[];
  environments: any[];
}

/**
 * Export to Moodle XML format (can be imported as course backup)
 */
export function exportToMoodleXML(data: LMSExportData): string {
  const sequences = data.solution?.didactic_template?.learning_sequences || [];
  const title = data.metadata?.title || 'Lernpfad';
  const description = data.metadata?.description || '';
  
  let sectionId = 1;
  let activityId = 1;
  
  // Build sections from sequences/phases
  let sectionsXml = '';
  let activitiesXml = '';
  
  sequences.forEach((sequence: any, seqIndex: number) => {
    // Each sequence becomes a section
    sectionsXml += `
    <section id="${sectionId}">
      <number>${seqIndex}</number>
      <name>${escapeXml(sequence.sequence_name || `Sequenz ${seqIndex + 1}`)}</name>
      <summary>${escapeXml(sequence.learning_goal || '')}</summary>
      <summaryformat>1</summaryformat>
      <visible>1</visible>
      <availabilityjson>null</availabilityjson>
    </section>`;
    
    const currentSectionId = sectionId;
    sectionId++;
    
    // Each phase/activity becomes a Moodle activity
    (sequence.phases || []).forEach((phase: any) => {
      (phase.activities || []).forEach((activity: any) => {
        // Create a page activity for each learning activity
        activitiesXml += `
    <activity id="${activityId}" moduleid="${activityId}" modulename="page" contextid="${activityId + 1000}">
      <page id="${activityId}">
        <name>${escapeXml(activity.name || 'Aktivität')}</name>
        <intro>${escapeXml(activity.description || '')}</intro>
        <introformat>1</introformat>
        <content>${escapeXml(buildActivityContent(activity, data.environments, data.actors))}</content>
        <contentformat>1</contentformat>
        <legacyfiles>0</legacyfiles>
        <legacyfileslast>null</legacyfileslast>
        <display>5</display>
        <displayoptions>a:2:{s:12:"printheading";s:1:"1";s:10:"printintro";s:1:"0";}</displayoptions>
        <revision>1</revision>
        <timemodified>${Math.floor(Date.now() / 1000)}</timemodified>
      </page>
      <sectionid>${currentSectionId}</sectionid>
    </activity>`;
        activityId++;
        
        // Add URL activities for WLO resources
        const roles = activity.roles || [];
        roles.forEach((role: any) => {
          if (role.learning_environment?.selected_materials) {
            role.learning_environment.selected_materials.forEach((matId: string) => {
              const env = data.environments.find((e: any) => e.id === role.learning_environment?.environment_id);
              const mat = env?.materials?.find((m: any) => m.id === matId);
              if (mat?.wlo_metadata?.length > 0) {
                mat.wlo_metadata.forEach((wlo: any) => {
                  if (wlo.wwwUrl) {
                    activitiesXml += `
    <activity id="${activityId}" moduleid="${activityId}" modulename="url" contextid="${activityId + 1000}">
      <url id="${activityId}">
        <name>${escapeXml(wlo.title || mat.name)}</name>
        <intro>${escapeXml(wlo.description || '')}</intro>
        <introformat>1</introformat>
        <externalurl>${escapeXml(wlo.wwwUrl)}</externalurl>
        <display>0</display>
        <displayoptions>a:1:{s:10:"printintro";i:1;}</displayoptions>
        <parameters>a:0:{}</parameters>
        <timemodified>${Math.floor(Date.now() / 1000)}</timemodified>
      </url>
      <sectionid>${currentSectionId}</sectionid>
    </activity>`;
                    activityId++;
                  }
                });
              }
            });
          }
        });
      });
    });
  });

  // Build complete Moodle backup XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<moodle_backup>
  <information>
    <name>${escapeXml(title)}</name>
    <moodle_version>2023100900</moodle_version>
    <moodle_release>4.3</moodle_release>
    <backup_version>2023100900</backup_version>
    <backup_release>4.3</backup_release>
    <backup_date>${Math.floor(Date.now() / 1000)}</backup_date>
    <original_wwwroot>https://lernpfad-editor.local</original_wwwroot>
    <original_site_identifier_hash>lernpfadeditor</original_site_identifier_hash>
    <original_course_id>1</original_course_id>
    <original_course_fullname>${escapeXml(title)}</original_course_fullname>
    <original_course_shortname>${escapeXml(title.substring(0, 20))}</original_course_shortname>
    <original_course_startdate>${Math.floor(Date.now() / 1000)}</original_course_startdate>
  </information>
  <course>
    <shortname>${escapeXml(title.substring(0, 20))}</shortname>
    <fullname>${escapeXml(title)}</fullname>
    <summary>${escapeXml(description)}</summary>
    <summaryformat>1</summaryformat>
    <format>topics</format>
    <showgrades>1</showgrades>
    <newsitems>5</newsitems>
    <startdate>${Math.floor(Date.now() / 1000)}</startdate>
    <marker>0</marker>
    <maxbytes>0</maxbytes>
    <legacyfiles>0</legacyfiles>
    <showreports>0</showreports>
    <visible>1</visible>
    <groupmode>0</groupmode>
    <groupmodeforce>0</groupmodeforce>
    <defaultgroupingid>0</defaultgroupingid>
    <lang></lang>
    <theme></theme>
    <timecreated>${Math.floor(Date.now() / 1000)}</timecreated>
    <timemodified>${Math.floor(Date.now() / 1000)}</timemodified>
    <enablecompletion>1</enablecompletion>
  </course>
  <sections>
    <section id="0">
      <number>0</number>
      <name>Allgemein</name>
      <summary>${escapeXml(description)}</summary>
      <summaryformat>1</summaryformat>
      <visible>1</visible>
    </section>${sectionsXml}
  </sections>
  <activities>${activitiesXml}
  </activities>
</moodle_backup>`;

  return xml;
}

/**
 * Export to IMS Common Cartridge format (universal LMS format)
 * Compliant with IMS CC 1.3 specification
 */
export async function exportToIMSCC(data: LMSExportData): Promise<Blob> {
  const zip = new JSZip();
  const sequences = data.solution?.didactic_template?.learning_sequences || [];
  const title = data.metadata?.title || 'Lernpfad';
  const description = data.metadata?.description || '';
  const dateStr = new Date().toISOString().split('T')[0];
  
  // Generate unique identifiers
  const courseId = `i${generateUUID()}`;
  const generateId = () => `i${generateUUID().substring(0, 32)}`;
  
  // Build manifest items and resources
  let itemsXml = '';
  let resourcesXml = '';
  const webContentFiles: { path: string; content: string }[] = [];
  
  sequences.forEach((sequence: any, seqIndex: number) => {
    const seqItemId = generateId();
    let seqChildItems = '';
    
    (sequence.phases || []).forEach((phase: any, phaseIndex: number) => {
      const phaseItemId = generateId();
      let phaseChildItems = '';
      
      (phase.activities || []).forEach((activity: any) => {
        const actItemId = generateId();
        const actResourceId = generateId();
        const htmlFileName = `web_resources/${actResourceId}.html`;
        
        // Create HTML content for activity
        const htmlContent = createActivityHTML(activity, data.environments, data.actors);
        webContentFiles.push({ path: htmlFileName, content: htmlContent });
        
        phaseChildItems += `
            <item identifier="${actItemId}" identifierref="${actResourceId}">
              <title>${escapeXml(activity.name || 'Aktivität')}</title>
            </item>`;
        
        resourcesXml += `
    <resource identifier="${actResourceId}" type="webcontent" href="${htmlFileName}">
      <file href="${htmlFileName}"/>
    </resource>`;
        
        // Add WLO resources as web links
        const roles = activity.roles || [];
        roles.forEach((role: any) => {
          const envId = role.learning_environment?.environment_id;
          const env = data.environments.find((e: any) => e.id === envId);
          
          // Process materials
          (role.learning_environment?.selected_materials || []).forEach((matId: string) => {
            const mat = env?.materials?.find((m: any) => m.id === matId);
            (mat?.wlo_metadata || []).forEach((wlo: any) => {
              if (wlo.wwwUrl) {
                const linkItemId = generateId();
                const linkResourceId = generateId();
                const weblinkPath = `web_resources/${linkResourceId}.xml`;
                
                phaseChildItems += `
            <item identifier="${linkItemId}" identifierref="${linkResourceId}">
              <title>${escapeXml(wlo.title || mat.name)}</title>
            </item>`;
                
                resourcesXml += `
    <resource identifier="${linkResourceId}" type="imswl_xmlv1p3">
      <file href="${weblinkPath}"/>
    </resource>`;
                
                // Create weblink XML with proper namespace
                const weblinkXml = `<?xml version="1.0" encoding="UTF-8"?>
<webLink xmlns="http://www.imsglobal.org/xsd/imsccv1p3/imswl_v1p3"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.imsglobal.org/xsd/imsccv1p3/imswl_v1p3 http://www.imsglobal.org/profile/cc/ccv1p3/ccv1p3_imswl_v1p3.xsd">
  <title>${escapeXml(wlo.title || mat.name)}</title>
  <url href="${escapeXml(wlo.wwwUrl)}" target="_blank"/>
</webLink>`;
                zip.file(weblinkPath, weblinkXml);
              }
            });
          });
          
          // Process tools
          (role.learning_environment?.selected_tools || []).forEach((toolId: string) => {
            const tool = env?.tools?.find((t: any) => t.id === toolId);
            (tool?.wlo_metadata || []).forEach((wlo: any) => {
              if (wlo.wwwUrl) {
                const linkItemId = generateId();
                const linkResourceId = generateId();
                const weblinkPath = `web_resources/${linkResourceId}.xml`;
                
                phaseChildItems += `
            <item identifier="${linkItemId}" identifierref="${linkResourceId}">
              <title>${escapeXml(wlo.title || tool.name)}</title>
            </item>`;
                
                resourcesXml += `
    <resource identifier="${linkResourceId}" type="imswl_xmlv1p3">
      <file href="${weblinkPath}"/>
    </resource>`;
                
                const weblinkXml = `<?xml version="1.0" encoding="UTF-8"?>
<webLink xmlns="http://www.imsglobal.org/xsd/imsccv1p3/imswl_v1p3"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.imsglobal.org/xsd/imsccv1p3/imswl_v1p3 http://www.imsglobal.org/profile/cc/ccv1p3/ccv1p3_imswl_v1p3.xsd">
  <title>${escapeXml(wlo.title || tool.name)}</title>
  <url href="${escapeXml(wlo.wwwUrl)}" target="_blank"/>
</webLink>`;
                zip.file(weblinkPath, weblinkXml);
              }
            });
          });
        });
      });
      
      // Add phase as sub-item
      seqChildItems += `
          <item identifier="${phaseItemId}">
            <title>${escapeXml(phase.phase_name || `Phase ${phaseIndex + 1}`)}</title>${phaseChildItems}
          </item>`;
    });
    
    itemsXml += `
        <item identifier="${seqItemId}">
          <title>${escapeXml(sequence.sequence_name || `Lernsequenz ${seqIndex + 1}`)}</title>${seqChildItems}
        </item>`;
  });
  
  // Create manifest with proper CC 1.3 namespaces and schema locations
  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}"
          xmlns="http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1"
          xmlns:lom="http://ltsc.ieee.org/xsd/imsccv1p3/LOM/resource"
          xmlns:lomimscc="http://ltsc.ieee.org/xsd/imsccv1p3/LOM/manifest"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1 http://www.imsglobal.org/profile/cc/ccv1p3/ccv1p3_imscp_v1p2_v1p0.xsd
                              http://ltsc.ieee.org/xsd/imsccv1p3/LOM/manifest http://www.imsglobal.org/profile/cc/ccv1p3/LOM/ccv1p3_lommanifest_v1p0.xsd
                              http://ltsc.ieee.org/xsd/imsccv1p3/LOM/resource http://www.imsglobal.org/profile/cc/ccv1p3/LOM/ccv1p3_lomresource_v1p0.xsd">
  <metadata>
    <schema>IMS Common Cartridge</schema>
    <schemaversion>1.3.0</schemaversion>
    <lomimscc:lom>
      <lomimscc:general>
        <lomimscc:title>
          <lomimscc:string language="de">${escapeXml(title)}</lomimscc:string>
        </lomimscc:title>
        <lomimscc:description>
          <lomimscc:string language="de">${escapeXml(description)}</lomimscc:string>
        </lomimscc:description>
        <lomimscc:language>de</lomimscc:language>
      </lomimscc:general>
      <lomimscc:lifeCycle>
        <lomimscc:contribute>
          <lomimscc:date>
            <lomimscc:dateTime>${dateStr}</lomimscc:dateTime>
          </lomimscc:date>
        </lomimscc:contribute>
      </lomimscc:lifeCycle>
      <lomimscc:rights>
        <lomimscc:copyrightAndOtherRestrictions>
          <lomimscc:value>yes</lomimscc:value>
        </lomimscc:copyrightAndOtherRestrictions>
        <lomimscc:description>
          <lomimscc:string language="de">CC BY-SA 4.0</lomimscc:string>
        </lomimscc:description>
      </lomimscc:rights>
    </lomimscc:lom>
  </metadata>
  <organizations>
    <organization identifier="org_1" structure="rooted-hierarchy">
      <item identifier="root">
        <title>${escapeXml(title)}</title>${itemsXml}
      </item>
    </organization>
  </organizations>
  <resources>${resourcesXml}
  </resources>
</manifest>`;
  
  // Add files to ZIP
  zip.file('imsmanifest.xml', manifest);
  webContentFiles.forEach(file => {
    zip.file(file.path, file.content);
  });
  
  // Generate ZIP blob
  return await zip.generateAsync({ type: 'blob' });
}

// Generate UUID for IMS CC identifiers
function generateUUID(): string {
  return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, () => {
    return Math.floor(Math.random() * 16).toString(16);
  });
}

// Helper: Build activity content for Moodle
function buildActivityContent(activity: any, _environments: any[], actors?: any[]): string {
  let content = `<h3>${activity.name || 'Aktivität'}</h3>`;
  content += `<p>${activity.description || ''}</p>`;
  content += `<p><strong>Dauer:</strong> ${activity.duration || 0} Minuten</p>`;
  
  if (activity.roles?.length > 0) {
    content += '<h4>Rollen und Aufgaben:</h4>';
    activity.roles.forEach((role: any) => {
      const actor = actors?.find((a: any) => a.id === role.actor_id);
      content += `<div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">`;
      content += `<strong>${role.role_name || 'Rolle'}:</strong> ${role.task_description || ''}`;
      
      // Add differentiation options if selected
      if (role.selected_differentiation?.length > 0 && actor?.differentiation_options) {
        const diffOptions = role.selected_differentiation
          .map((diffId: string) => actor.differentiation_options.find((d: any) => d.id === diffId))
          .filter(Boolean);
        
        if (diffOptions.length > 0) {
          content += '<div style="margin-top: 8px; padding: 8px; background: #e8eaf6; border-radius: 4px;">';
          content += '<strong style="color: #3949ab;">Binnendifferenzierung:</strong><ul style="margin: 5px 0 0 0; padding-left: 20px;">';
          diffOptions.forEach((diff: any) => {
            content += `<li><strong>${diff.label}</strong>`;
            if (diff.description) content += ` - ${diff.description}`;
            if (diff.hints?.length > 0) {
              content += '<ul style="margin: 3px 0; padding-left: 15px;">';
              diff.hints.forEach((hint: string) => {
                content += `<li style="font-size: 0.9em;">${hint}</li>`;
              });
              content += '</ul>';
            }
            content += '</li>';
          });
          content += '</ul></div>';
        }
      }
      content += '</div>';
    });
  }
  
  return content;
}

// Helper: Create HTML content for IMS CC
function createActivityHTML(activity: any, _environments: any[], actors: any[]): string {
  const rolesHtml = (activity.roles || []).map((role: any) => {
    const actor = actors.find((a: any) => a.id === role.actor_id);
    
    // Get differentiation options
    let diffHtml = '';
    if (role.selected_differentiation?.length > 0 && actor?.differentiation_options) {
      const diffOptions = role.selected_differentiation
        .map((diffId: string) => actor.differentiation_options.find((d: any) => d.id === diffId))
        .filter(Boolean);
      
      if (diffOptions.length > 0) {
        diffHtml = `<div class="differentiation">
          <strong>Binnendifferenzierung:</strong>
          <ul>
            ${diffOptions.map((diff: any) => `
              <li>
                <strong>${escapeXml(diff.label)}</strong>
                ${diff.description ? ` - ${escapeXml(diff.description)}` : ''}
                ${diff.hints?.length > 0 ? `
                  <ul class="hints">
                    ${diff.hints.map((h: string) => `<li>${escapeXml(h)}</li>`).join('')}
                  </ul>
                ` : ''}
              </li>
            `).join('')}
          </ul>
        </div>`;
      }
    }
    
    return `<div class="role">
      <strong>${escapeXml(actor?.name || role.role_name || 'Rolle')}:</strong>
      <p>${escapeXml(role.task_description || '')}</p>
      ${diffHtml}
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${escapeXml(activity.name || 'Aktivität')}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
    h1 { color: #333; }
    .meta { color: #666; margin-bottom: 20px; }
    .role { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
    .differentiation { margin-top: 10px; padding: 10px; background: #e8eaf6; border-radius: 4px; }
    .differentiation ul { margin: 5px 0 0 0; padding-left: 20px; }
    .hints { font-size: 0.9em; margin: 3px 0; }
    .materials { margin-top: 20px; }
    .material { padding: 5px 0; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>${escapeXml(activity.name || 'Aktivität')}</h1>
  <p class="meta">Dauer: ${activity.duration || 0} Minuten</p>
  <p>${escapeXml(activity.description || '')}</p>
  
  ${activity.roles?.length > 0 ? `
  <h2>Rollen und Aufgaben</h2>
  ${rolesHtml}
  ` : ''}
</body>
</html>`;
}

// Helper: Escape XML special characters
function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Download helpers
export async function downloadMoodleXML(data: LMSExportData, filename: string) {
  // Create proper MBZ (Moodle Backup Zip) format
  const blob = await exportToMoodleMBZ(data);
  downloadBlob(blob, `${filename}.mbz`);
}

/**
 * Export to Moodle MBZ format (proper backup ZIP)
 */
async function exportToMoodleMBZ(data: LMSExportData): Promise<Blob> {
  const zip = new JSZip();
  const sequences = data.solution?.didactic_template?.learning_sequences || [];
  const title = data.metadata?.title || 'Lernpfad';
  const description = data.metadata?.description || '';
  const timestamp = Math.floor(Date.now() / 1000);
  
  let sectionId = 1;
  let activityId = 1;
  let contextId = 1;
  
  // Build sections and activities
  const sections: string[] = [];
  const activities: { id: number; type: string; name: string; sectionId: number }[] = [];
  
  // Section 0 - General
  sections.push(`
    <section id="0">
      <number>0</number>
      <name>Allgemein</name>
      <summary>${escapeXml(description)}</summary>
      <summaryformat>1</summaryformat>
      <sequence></sequence>
      <visible>1</visible>
    </section>`);
  
  sequences.forEach((sequence: any, seqIndex: number) => {
    const activityIds: number[] = [];
    
    // Create activities for this section
    (sequence.phases || []).forEach((phase: any) => {
      (phase.activities || []).forEach((activity: any) => {
        const actId = activityId++;
        activityIds.push(actId);
        
        // Create activity folder with module.xml
        const activityContent = buildActivityContent(activity, data.environments, data.actors);
        
        zip.file(`activities/page_${actId}/module.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<module id="${actId}" version="2023100900">
  <modulename>page</modulename>
  <sectionid>${sectionId}</sectionid>
  <sectionnumber>${seqIndex + 1}</sectionnumber>
  <added>${timestamp}</added>
  <score>0</score>
  <indent>0</indent>
  <visible>1</visible>
  <availability>null</availability>
  <completion>0</completion>
</module>`);

        zip.file(`activities/page_${actId}/page.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<activity id="${actId}" moduleid="${actId}" modulename="page" contextid="${contextId++}">
  <page id="${actId}">
    <name>${escapeXml(activity.name || 'Aktivität')}</name>
    <intro>${escapeXml(activity.description || '')}</intro>
    <introformat>1</introformat>
    <content>${escapeXml(activityContent)}</content>
    <contentformat>1</contentformat>
    <legacyfiles>0</legacyfiles>
    <display>5</display>
    <revision>1</revision>
    <timemodified>${timestamp}</timemodified>
  </page>
</activity>`);

        zip.file(`activities/page_${actId}/inforef.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<inforef></inforef>`);

        zip.file(`activities/page_${actId}/roles.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<roles></roles>`);

        activities.push({
          id: actId,
          type: 'page',
          name: activity.name || 'Aktivität',
          sectionId: sectionId
        });
        
        // Add WLO resources as URL activities
        const roles = activity.roles || [];
        roles.forEach((role: any) => {
          if (role.learning_environment?.selected_materials) {
            role.learning_environment.selected_materials.forEach((matId: string) => {
              const env = data.environments.find((e: any) => e.id === role.learning_environment?.environment_id);
              const mat = env?.materials?.find((m: any) => m.id === matId);
              if (mat?.wlo_metadata?.length > 0) {
                mat.wlo_metadata.forEach((wlo: any) => {
                  if (wlo.wwwUrl) {
                    const urlActId = activityId++;
                    activityIds.push(urlActId);
                    
                    zip.file(`activities/url_${urlActId}/module.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<module id="${urlActId}" version="2023100900">
  <modulename>url</modulename>
  <sectionid>${sectionId}</sectionid>
  <sectionnumber>${seqIndex + 1}</sectionnumber>
  <added>${timestamp}</added>
  <visible>1</visible>
</module>`);

                    zip.file(`activities/url_${urlActId}/url.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<activity id="${urlActId}" moduleid="${urlActId}" modulename="url" contextid="${contextId++}">
  <url id="${urlActId}">
    <name>${escapeXml(wlo.title || mat.name)}</name>
    <intro>${escapeXml(wlo.description || '')}</intro>
    <introformat>1</introformat>
    <externalurl>${escapeXml(wlo.wwwUrl)}</externalurl>
    <display>0</display>
    <timemodified>${timestamp}</timemodified>
  </url>
</activity>`);

                    zip.file(`activities/url_${urlActId}/inforef.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<inforef></inforef>`);

                    activities.push({
                      id: urlActId,
                      type: 'url',
                      name: wlo.title || mat.name,
                      sectionId: sectionId
                    });
                  }
                });
              }
            });
          }
        });
      });
    });
    
    // Add section
    sections.push(`
    <section id="${sectionId}">
      <number>${seqIndex + 1}</number>
      <name>${escapeXml(sequence.sequence_name || `Sequenz ${seqIndex + 1}`)}</name>
      <summary>${escapeXml(sequence.learning_goal || '')}</summary>
      <summaryformat>1</summaryformat>
      <sequence>${activityIds.join(',')}</sequence>
      <visible>1</visible>
    </section>`);
    
    sectionId++;
  });

  // Create moodle_backup.xml
  zip.file('moodle_backup.xml', `<?xml version="1.0" encoding="UTF-8"?>
<moodle_backup>
  <information>
    <name>${escapeXml(title)}</name>
    <moodle_version>2023100900</moodle_version>
    <moodle_release>4.3</moodle_release>
    <backup_version>2023100900</backup_version>
    <backup_release>4.3</backup_release>
    <backup_date>${timestamp}</backup_date>
    <mnet_remoteusers>0</mnet_remoteusers>
    <include_files>1</include_files>
    <include_file_references_to_external_content>0</include_file_references_to_external_content>
    <original_wwwroot>https://lernpfad-editor.local</original_wwwroot>
    <original_site_identifier_hash>lernpfadeditor${timestamp}</original_site_identifier_hash>
    <original_course_id>1</original_course_id>
    <original_course_format>topics</original_course_format>
    <original_course_fullname>${escapeXml(title)}</original_course_fullname>
    <original_course_shortname>${escapeXml(title.substring(0, 20))}</original_course_shortname>
    <original_course_startdate>${timestamp}</original_course_startdate>
    <original_system_contextid>1</original_system_contextid>
    <type>course</type>
    <format>moodle2</format>
    <interactive>0</interactive>
    <mode>10</mode>
    <execution>1</execution>
    <executiontime>0</executiontime>
  </information>
  <settings>
    <setting>
      <level>root</level>
      <name>filename</name>
      <value>${escapeXml(title)}.mbz</value>
    </setting>
    <setting>
      <level>root</level>
      <name>users</name>
      <value>0</value>
    </setting>
  </settings>
  <contents>
    <activities>
${activities.map(a => `      <activity>
        <moduleid>${a.id}</moduleid>
        <sectionid>${a.sectionId}</sectionid>
        <modulename>${a.type}</modulename>
        <title>${escapeXml(a.name)}</title>
        <directory>activities/${a.type}_${a.id}</directory>
      </activity>`).join('\n')}
    </activities>
    <sections>
${sections.map((_, i) => `      <section>
        <sectionid>${i}</sectionid>
        <title>Sektion ${i}</title>
        <directory>sections/section_${i}</directory>
      </section>`).join('\n')}
    </sections>
    <course>
      <courseid>1</courseid>
      <title>${escapeXml(title)}</title>
      <directory>course</directory>
    </course>
  </contents>
</moodle_backup>`);

  // Create course/course.xml
  zip.file('course/course.xml', `<?xml version="1.0" encoding="UTF-8"?>
<course id="1" contextid="1">
  <shortname>${escapeXml(title.substring(0, 20))}</shortname>
  <fullname>${escapeXml(title)}</fullname>
  <idnumber></idnumber>
  <summary>${escapeXml(description)}</summary>
  <summaryformat>1</summaryformat>
  <format>topics</format>
  <showgrades>1</showgrades>
  <newsitems>5</newsitems>
  <startdate>${timestamp}</startdate>
  <enddate>0</enddate>
  <visible>1</visible>
  <groupmode>0</groupmode>
  <groupmodeforce>0</groupmodeforce>
  <enablecompletion>1</enablecompletion>
  <lang>de</lang>
</course>`);

  // Create sections
  sections.forEach((_, i) => {
    zip.file(`sections/section_${i}/section.xml`, `<?xml version="1.0" encoding="UTF-8"?>
${sections[i]}`);
    zip.file(`sections/section_${i}/inforef.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<inforef></inforef>`);
  });

  // Create other required files
  zip.file('files.xml', `<?xml version="1.0" encoding="UTF-8"?>
<files></files>`);
  
  zip.file('scales.xml', `<?xml version="1.0" encoding="UTF-8"?>
<scales_definition></scales_definition>`);
  
  zip.file('outcomes.xml', `<?xml version="1.0" encoding="UTF-8"?>
<outcomes_definition></outcomes_definition>`);
  
  zip.file('questions.xml', `<?xml version="1.0" encoding="UTF-8"?>
<question_categories></question_categories>`);
  
  zip.file('roles.xml', `<?xml version="1.0" encoding="UTF-8"?>
<roles_definition></roles_definition>`);
  
  zip.file('groups.xml', `<?xml version="1.0" encoding="UTF-8"?>
<groups></groups>`);
  
  zip.file('course/inforef.xml', `<?xml version="1.0" encoding="UTF-8"?>
<inforef></inforef>`);
  
  zip.file('course/roles.xml', `<?xml version="1.0" encoding="UTF-8"?>
<roles></roles>`);
  
  zip.file('course/enrolments.xml', `<?xml version="1.0" encoding="UTF-8"?>
<enrolments></enrolments>`);

  return await zip.generateAsync({ type: 'blob' });
}

export async function downloadIMSCC(data: LMSExportData, filename: string) {
  const blob = await exportToIMSCC(data);
  downloadBlob(blob, `${filename}.imscc`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
