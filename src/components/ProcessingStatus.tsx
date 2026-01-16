interface ProcessingStatusProps {
  status: string[];
}

export function ProcessingStatus({ status }: ProcessingStatusProps) {
  if (status.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Verarbeitungsstatus</h2>
      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
        {status.map((message, index) => (
          <div key={index} className="mb-1">
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}