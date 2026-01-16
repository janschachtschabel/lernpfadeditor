import { FC } from 'react';

interface ProcessingStatusProps {
  status: string[];
}

export const ProcessingStatus: FC<ProcessingStatusProps> = ({ status }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Processing Status
    </label>
    <div className="h-[40vh] border rounded-lg overflow-y-auto bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap">
      {status.map((message, index) => (
        <div key={index} className="mb-1">
          {message.startsWith('curl') || message.startsWith('http') ? (
            <div className="bg-gray-100 p-2 rounded overflow-x-auto">
              {message}
            </div>
          ) : (
            message
          )}
        </div>
      ))}
    </div>
  </div>
);