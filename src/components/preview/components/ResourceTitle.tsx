import React from 'react';

interface ResourceTitleProps {
  title: string;
  url?: string;
}

export function ResourceTitle({ title, url }: ResourceTitleProps) {
  return (
    <h4 className="text-base font-medium line-clamp-2">
      {url ? (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {title}
        </a>
      ) : (
        title
      )}
    </h4>
  );
}