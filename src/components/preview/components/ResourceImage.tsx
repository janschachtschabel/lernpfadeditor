import React from 'react';

interface ResourceImageProps {
  url?: string;
  alt: string;
}

export function ResourceImage({ url, alt }: ResourceImageProps) {
  if (!url) return null;

  return (
    <div className="mb-3 h-32 relative">
      <img 
        src={url} 
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover rounded"
        loading="lazy"
      />
    </div>
  );
}