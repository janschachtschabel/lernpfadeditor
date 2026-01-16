import { WLOSearchParams, searchWLO } from '../../lib/wloApi';
import { WLOMetadata } from '../../lib/types';

export interface ProcessOptions {
  endpoint?: string;
  maxItems: number;
  combineMode: 'OR' | 'AND';
  signal?: AbortSignal;
}

function extractWLOMetadata(node: any): WLOMetadata {
  const properties = node.properties || {};
  return {
    title: properties['cclom:title']?.[0] || '',
    keywords: properties['cclom:general_keyword'] || [],
    description: properties['cclom:general_description']?.[0] || '',
    subject: properties['ccm:taxonid_DISPLAYNAME']?.[0] || '',
    educationalContext: properties['ccm:educationalcontext_DISPLAYNAME'] || [],
    wwwUrl: properties['ccm:wwwurl']?.[0] || null,
    previewUrl: node.preview?.url || null,
    resourceType: properties['ccm:oeh_lrt_aggregated_DISPLAYNAME']?.[0] || 
                 properties['ccm:resourcetype_DISPLAYNAME']?.[0] || 
                 properties['ccm:oeh_lrt_aggregated']?.[0]?.split('/').pop() || 
                 'Lernressource'
  };
}

async function processResourceItem(
  resource: any,
  type: string,
  environmentName: string,
  addStatus: (message: string) => void,
  options: ProcessOptions
) {
  if (!resource.filter_criteria || Object.keys(resource.filter_criteria).length === 0) {
    addStatus(`⚠️ Keine Filterkriterien definiert für ${type} "${resource.name}"`);
    return resource;
  }

  const properties = Object.keys(resource.filter_criteria);
  const values = Object.values(resource.filter_criteria) as string[];

  addStatus(`🔍 Suche mit Kriterien: ${properties.map((p, i) => `${p}=${values[i]}`).join(', ')}`);

  try {
    if (options.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    addStatus('🚀 Sende WLO-Anfrage...');
    const searchResults = await searchWLO({
      properties,
      values,
      maxItems: options.maxItems,
      endpoint: options.endpoint,
      combineMode: options.combineMode,
      signal: options.signal
    });

    if (!searchResults.nodes || searchResults.nodes.length === 0) {
      addStatus(`ℹ️ Keine WLO-Ergebnisse gefunden für ${type} "${resource.name}"`);
      return resource;
    }

    // Extrahiere die Node-UUIDs aus den Properties
    const nodeIds = searchResults.nodes
      .map(node => node.properties['sys:node-uuid']?.[0])
      .filter(Boolean)
      .join(',');

    // Extrahiere die Metadaten für alle gefundenen Nodes
    const wloMetadataArray = searchResults.nodes.map(node => ({
      title: node.properties['cclom:title']?.[0] || '',
      keywords: node.properties['cclom:general_keyword'] || [],
      description: node.properties['cclom:general_description']?.[0] || '',
      subject: node.properties['ccm:taxonid_DISPLAYNAME']?.[0] || '',
      educationalContext: node.properties['ccm:educationalcontext_DISPLAYNAME'] || [],
      wwwUrl: node.properties['ccm:wwwurl']?.[0] || null,
      previewUrl: node.ref?.id ? `https://redaktion.openeduhub.net/edu-sharing/preview?nodeId=${node.ref.id}&storeProtocol=workspace&storeId=SpacesStore` : null,
      resourceType: node.properties['ccm:oeh_lrt_aggregated_DISPLAYNAME']?.[0] || 
                   node.properties['ccm:resourcetype_DISPLAYNAME']?.[0] || 
                   node.properties['ccm:oeh_lrt_aggregated']?.[0]?.split('/').pop() || 
                   'Lernressource'
    }));

    addStatus(`✅ ${searchResults.nodes.length} WLO-Ergebnisse gefunden:`);
    searchResults.nodes.forEach((node, index) => {
      addStatus(`   ${index + 1}. ${node.properties['cclom:title']?.[0] || 'Ohne Titel'}`);
      if (node.properties['cclom:general_description']?.[0]) {
        addStatus(`      ${node.properties['cclom:general_description'][0].substring(0, 100)}...`);
      }
      if (node.properties['ccm:wwwurl']?.[0]) {
        addStatus(`      URL: ${node.properties['ccm:wwwurl'][0]}`);
      }
      if (node.properties['sys:node-uuid']?.[0]) {
        addStatus(`      ID: ${node.properties['sys:node-uuid'][0]}`);
      }
    });
    
    return {
      ...resource,
      source: 'database',
      database_id: nodeIds,
      wlo_metadata: wloMetadataArray // Speichere alle Metadaten als Array
    };

  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    console.error('Error processing resource:', error);
    addStatus(`❌ Fehler bei der WLO-Verarbeitung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    return resource;
  }
}

export async function processResources(
  resources: any[],
  type: string,
  selectedIds: string[] | undefined,
  environmentName: string,
  addStatus: (message: string) => void,
  options: ProcessOptions
) {
  if (!resources || resources.length === 0) {
    addStatus(`⚠️ Keine ${type} zum Verarbeiten gefunden`);
    return [];
  }

  addStatus(`📊 Verarbeite ${resources.length} ${type}...`);
  
  // Separate resources that need WLO processing from those that don't
  const toProcess = resources.filter(r => r.source === 'filter');
  const noProcess = resources.filter(r => r.source !== 'filter');
  
  if (toProcess.length === 0) {
    return resources;
  }

  addStatus(`⚡ Parallele WLO-Verarbeitung für ${toProcess.length} ${type}...`);
  
  // Process all resources in parallel (batch of 5 to avoid rate limits)
  const BATCH_SIZE = 5;
  const processedResources: any[] = [];
  
  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);
    addStatus(`\n🔄 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toProcess.length / BATCH_SIZE)}: ${batch.map(r => r.name).join(', ')}`);
    
    const batchResults = await Promise.all(
      batch.map(resource => 
        processResourceItem(resource, type, environmentName, addStatus, options)
          .catch(err => {
            addStatus(`❌ Fehler bei "${resource.name}": ${err.message}`);
            return resource;
          })
      )
    );
    
    processedResources.push(...batchResults);
  }
  
  // Combine processed and non-processed resources, maintaining original order
  return resources.map(r => {
    if (r.source === 'filter') {
      return processedResources.find(pr => pr.id === r.id) || r;
    }
    return r;
  });
}