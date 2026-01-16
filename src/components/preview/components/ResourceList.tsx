interface ResourceListProps {
  resources: any[];
  type: string;
  onResourceClick: (resources: any[]) => void;
}

export function ResourceList({ 
  resources, 
  type,
  onResourceClick
}: ResourceListProps) {
  // Group resources by whether they have metadata
  const resourcesWithMetadata = resources.filter(r => r.wlo_metadata && r.wlo_metadata.length > 0);
  const hasMetadata = resourcesWithMetadata.length > 0;

  return (
    <div className="text-sm">
      <span className="text-gray-600">{type}:</span>{' '}
      {resources.map((resource, idx) => {
        const hasWlo = resource.wlo_metadata && resource.wlo_metadata.length > 0;
        return (
          <span key={`${resource.id}-${idx}`}>
            {idx > 0 && ', '}
            {hasWlo ? (
              <button
                onClick={() => onResourceClick([resource])}
                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                title={`${resource.wlo_metadata.length} WLO-Inhalte verfügbar`}
              >
                {resource.name} 📚
              </button>
            ) : (
              <span className="text-gray-700">{resource.name}</span>
            )}
          </span>
        );
      })}
      {hasMetadata && (
        <span className="text-xs text-blue-500 ml-1">
          ({resourcesWithMetadata.length} mit WLO)
        </span>
      )}
    </div>
  );
}