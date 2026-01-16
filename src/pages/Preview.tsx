import { useState } from 'react';
import { FlowGraph } from '../components/preview/FlowGraph';
import { TableView } from '../components/preview/TableView';
import { RawData } from '../components/preview/RawData';
import { SaveLoad } from '../components/SaveLoad';
import { EyeIcon, TableCellsIcon, ShareIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

type ViewTab = 'table' | 'graph' | 'raw';

export function Preview() {
  const [activeTab, setActiveTab] = useState<ViewTab>('table');

  const tabs = [
    { id: 'table' as ViewTab, label: 'Tabellenansicht', icon: TableCellsIcon },
    { id: 'graph' as ViewTab, label: 'Graphansicht', icon: ShareIcon },
    { id: 'raw' as ViewTab, label: 'Rohdaten', icon: CodeBracketIcon },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold">7</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vorschau</h1>
            <p className="text-sm text-gray-500">Template überprüfen und exportieren</p>
          </div>
        </div>
        <SaveLoad />
      </div>

      {/* Info Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
        <div className="relative z-10 flex items-start gap-4">
          <EyeIcon className="w-8 h-8 flex-shrink-0" />
          <div>
            <h2 className="font-semibold mb-1">Ihr didaktisches Template</h2>
            <p className="text-sm text-white/80">
              Überprüfen Sie alle Elemente in verschiedenen Ansichten und exportieren Sie das fertige Template.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'table' && <TableView />}
          {activeTab === 'graph' && <FlowGraph />}
          {activeTab === 'raw' && <RawData />}
        </div>
      </div>
    </div>
  );
}