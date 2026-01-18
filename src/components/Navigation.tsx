import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  Cog6ToothIcon,
  PuzzlePieceIcon,
  UsersIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  BoltIcon,
  EyeIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useTemplateStore } from '../store/templateStore';

const navItems = [
  { 
    path: '/',
    label: 'Start',
    icon: HomeIcon,
    step: 0,
    checkComplete: () => true
  },
  { 
    path: '/general-settings', 
    label: 'Allgemeines',
    icon: Cog6ToothIcon,
    step: 1,
    checkComplete: (state: any) => state.metadata?.title && state.context?.subject
  },
  { 
    path: '/pattern-elements', 
    label: 'Didaktik',
    icon: PuzzlePieceIcon,
    step: 2,
    checkComplete: (state: any) => state.problem?.learning_goals?.length > 0
  },
  { 
    path: '/actors', 
    label: 'Akteure',
    icon: UsersIcon,
    step: 3,
    checkComplete: (state: any) => state.actors?.length > 0
  },
  { 
    path: '/environments', 
    label: 'Umgebungen',
    icon: BuildingLibraryIcon,
    step: 4,
    checkComplete: (state: any) => state.environments?.length > 0
  },
  { 
    path: '/shopping-cart', 
    label: 'WLO Suche',
    icon: ShoppingCartIcon,
    step: 5,
    checkComplete: () => false
  },
  { 
    path: '/course-flow', 
    label: 'Ablauf',
    icon: AcademicCapIcon,
    step: 6,
    checkComplete: (state: any) => state.solution?.didactic_template?.learning_sequences?.length > 0
  },
  { 
    path: '/preview', 
    label: 'Vorschau',
    icon: EyeIcon,
    step: 7,
    checkComplete: () => false
  },
  { 
    path: '/material-generator', 
    label: 'Material',
    icon: DocumentTextIcon,
    step: 8,
    checkComplete: () => false
  },
  ];

export function Navigation() {
  const location = useLocation();
  const state = useTemplateStore();
  
  const currentStepIndex = navItems.findIndex(item => item.path === location.pathname);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4">
        {/* Logo and Title */}
        <div className="flex items-center justify-between py-2 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Lernpfad Editor</h1>
              <p className="text-xs text-slate-400">Didaktische Unterrichtsplanung</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* KI Assistent Button */}
            <Link
              to="/ai-flow-agent"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                location.pathname === '/ai-flow-agent'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gradient-to-r from-violet-500/20 to-purple-600/20 text-purple-300 hover:from-violet-500 hover:to-purple-600 hover:text-white hover:shadow-lg hover:shadow-purple-500/30'
              }`}
            >
              <BoltIcon className="w-4 h-4" />
              <span className="hidden sm:inline">KI Assistent</span>
            </Link>

            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-slate-400">Fortschritt:</span>
              <div className="flex gap-1">
                {navItems.slice(1, 7).map((item, i) => (
                  <div 
                    key={item.path}
                    className={`w-2 h-2 rounded-full transition-all ${
                      item.checkComplete(state) 
                        ? 'bg-green-500' 
                        : i < currentStepIndex 
                          ? 'bg-blue-500' 
                          : 'bg-slate-600'
                    }`}
                    title={item.label}
                  />
                ))}
              </div>
            </div>
            
            {/* Settings Link */}
            <Link 
              to="/settings"
              className={`p-2 rounded-lg transition-colors ${
                location.pathname === '/settings'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Einstellungen"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        {/* Navigation Items */}
        <div className="flex overflow-x-auto scrollbar-hide py-1 -mx-1">
          {navItems.map(({ path, label, icon: Icon, step, checkComplete }, index) => {
            const isActive = location.pathname === path;
            const isComplete = checkComplete(state);
            const isPast = index < currentStepIndex;
            
            return (
              <Link
                key={path}
                to={path}
                className={`group relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all rounded-lg mx-1 ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Step number or check */}
                <div className={`relative flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : isComplete 
                      ? 'bg-green-500/20 text-green-400'
                      : isPast
                        ? 'bg-slate-600 text-slate-300'
                        : 'bg-slate-700 text-slate-500'
                }`}>
                  {isComplete && !isActive ? (
                    <CheckCircleSolid className="w-5 h-5 text-green-400" />
                  ) : (
                    step > 0 ? step : <Icon className="w-4 h-4" />
                  )}
                </div>
                
                <span className={`hidden lg:block ${isActive ? 'text-white' : ''}`}>
                  {label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 rounded-full" />
                )}
                
                {/* Tooltip for mobile */}
                <div className="lg:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}