import React from 'react';

interface ResourceLinkProps {
  resource: {
    wlo_metadata?: any | any[];
    name: string;
    access_link?: string;
  };
  onClick?: () => void;
}

export function ResourceLink({ resource, onClick }: ResourceLinkProps) {
  const metadata = resource.wlo_metadata 
    ? Array.isArray(resource.wlo_metadata) 
      ? resource.wlo_metadata[0] 
      : resource.wlo_metadata
    : null;

  const hasMetadata = !!metadata;
  const title = resource.name;

  return hasMetadata ? (
    <button
      onClick={onClick}
      className="text-blue-600 hover:underline cursor-pointer"
      title={metadata?.description || ''}
    >
      {title}
    </button>
  ) : (
    <span 
      className="text-gray-700"
      title={metadata?.description || ''}
    >
      {title}
    </span>
  );
}