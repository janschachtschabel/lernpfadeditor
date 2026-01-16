// Template type alias for compatibility
export type Template = any;

// Update WLOMetadata interface to support arrays
export interface Resource {
  id: string;
  name: string;
  source: 'manual' | 'database' | 'filter';
  access_link: string;
  database_id?: string;
  filter_criteria?: Record<string, string>;
  wlo_metadata?: WLOMetadata | WLOMetadata[]; // Allow single metadata or array
}

export interface Material extends Resource {
  material_type: string;
}

export interface Tool extends Resource {
  tool_type: string;
}

export interface Service extends Resource {
  service_type: string;
}

export interface WLOMetadata {
  title: string;
  keywords: string[];
  description: string;
  subject: string;
  educationalContext: string[];
  wwwUrl: string | null;
  previewUrl: string | null;
}