import { FC } from 'react';
import { Panel } from 'reactflow';

export const Legend: FC = () => (
  <Panel position="top-left" className="bg-white/95 backdrop-blur p-3 rounded-lg shadow-lg">
    <div className="space-y-1.5 text-xs">
      <div className="font-semibold text-gray-700 mb-2">Elemente</div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6', border: '2px solid #1d4ed8' }}></div>
        <span>Lernsequenz</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dcfce7', border: '2px solid #22c55e' }}></div>
        <span>Phase</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fef9c3', border: '2px solid #eab308' }}></div>
        <span>Aktivität</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffedd5', border: '2px solid #f97316' }}></div>
        <span>Rolle</span>
      </div>
      
      <div className="font-semibold text-gray-700 mt-3 mb-2">Verbindungen</div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-0 border-t-2" style={{ borderColor: '#475569' }}></div>
        <span>Sequenzieller Fluss</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-0 border-t-2" style={{ borderColor: '#8b5cf6' }}></div>
        <span>Paralleler Fluss</span>
      </div>
    </div>
  </Panel>
);