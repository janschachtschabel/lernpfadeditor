interface DifferentiationInfo {
  label: string;
  description: string;
  hints: string[];
}

interface RoleCellProps {
  roleInfo: {
    role: {
      role_name?: string;
      task_description?: string;
      selected_differentiation?: string[];
    };
    differentiation?: DifferentiationInfo[];
    materials?: any[];
    tools?: any[];
    services?: any[];
  };
  onResourceClick?: (resources: any[]) => void;
}

export function RoleCell({
  roleInfo,
  onResourceClick
}: RoleCellProps) {
  const { materials = [], tools = [], services = [], differentiation = [] } = roleInfo;
  
  return (
    <div className="mb-3">
      <div className="font-medium text-sm">
        {roleInfo.role.role_name || 'Unbenannte Rolle'}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">
        {roleInfo.role.task_description}
      </div>
      
      {/* Differentiation hints - compact with tooltip on hover */}
      {differentiation.length > 0 && differentiation.some(d => (d.hints || []).length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {differentiation.map((d, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full cursor-help"
              title={`${d.description}\n\nHinweise:\n• ${(d.hints || []).join('\n• ')}`}
            >
              <span className="text-indigo-500">●</span>
              {d.label}
            </span>
          ))}
        </div>
      )}
      
      {/* Materials assigned to this role */}
      {materials.length > 0 && (
        <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-2">
          <span className="text-gray-400">📚</span>
          <span>
            {materials.map((m, idx) => {
              const wloCount = m.wlo_metadata?.length || 0;
              const hasWlo = wloCount > 0;
              return (
                <span key={m.id}>
                  {idx > 0 && ', '}
                  {hasWlo ? (
                    <button
                      onClick={() => onResourceClick?.([m])}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      title={`${wloCount} WLO-Inhalte`}
                    >
                      {m.name} ({wloCount})
                    </button>
                  ) : (
                    <span>{m.name}</span>
                  )}
                </span>
              );
            })}
          </span>
        </div>
      )}
      
      {/* Tools assigned to this role */}
      {tools.length > 0 && (
        <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-1">
          <span className="text-gray-400">🔧</span>
          <span>
            {tools.map((t, idx) => {
              const wloCount = t.wlo_metadata?.length || 0;
              const hasWlo = wloCount > 0;
              return (
                <span key={t.id}>
                  {idx > 0 && ', '}
                  {hasWlo ? (
                    <button
                      onClick={() => onResourceClick?.([t])}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      title={`${wloCount} WLO-Inhalte`}
                    >
                      {t.name} ({wloCount})
                    </button>
                  ) : (
                    <span>{t.name}</span>
                  )}
                </span>
              );
            })}
          </span>
        </div>
      )}
      
      {/* Services assigned to this role */}
      {services.length > 0 && (
        <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-1">
          <span className="text-gray-400">☁️</span>
          <span>{services.map(s => s.name).join(', ')}</span>
        </div>
      )}
    </div>
  );
}