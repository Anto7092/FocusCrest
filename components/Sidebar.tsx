import * as React from 'react';
import type { View } from '../types';
import { AssistantIcon, YouTubeIcon, TimerIcon, NotesIcon, MusicIcon, AppLogo, PlannerIcon } from './icons';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isSidebarOpen: boolean;
}

const SidebarButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const baseClasses = "flex items-center w-full px-4 py-3 transition-all duration-300 ease-in-out transform rounded-lg";
  const activeClasses = "bg-emerald-400/20 text-emerald-200 font-semibold shadow-inner";
  const inactiveClasses = "text-slate-300 hover:bg-white/10 hover:translate-x-1";
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen }) => {
  return (
    <nav className={`flex-shrink-0 flex flex-col w-64 h-full bg-slate-900/40 backdrop-blur-lg border-r border-white/10 shadow-2xl z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-0' : '-ml-64'}`}>
      <div className="flex items-center justify-center h-20 px-4 border-b border-white/10">
        <AppLogo className="h-10 text-emerald-400" />
      </div>
      <div className="flex flex-col flex-grow p-4 gap-2">
        <SidebarButton 
          label="Study Planner"
          icon={<PlannerIcon className="w-6 h-6" />}
          isActive={activeView === 'planner'}
          onClick={() => setActiveView('planner')}
        />
        <SidebarButton 
          label="AI Assistant"
          icon={<AssistantIcon className="w-6 h-6" />}
          isActive={activeView === 'assistant'}
          onClick={() => setActiveView('assistant')}
        />
        <SidebarButton 
          label="EduTube"
          icon={<YouTubeIcon className="w-6 h-6" />}
          isActive={activeView === 'youtube'}
          onClick={() => setActiveView('youtube')}
        />
        <SidebarButton 
          label="Pomodoro Timer"
          icon={<TimerIcon className="w-6 h-6" />}
          isActive={activeView === 'pomodoro'}
          onClick={() => setActiveView('pomodoro')}
        />
        <SidebarButton 
          label="Scratch Pad"
          icon={<NotesIcon className="w-6 h-6" />}
          isActive={activeView === 'notes'}
          onClick={() => setActiveView('notes')}
        />
        <SidebarButton 
          label="Focus Music"
          icon={<MusicIcon className="w-6 h-6" />}
          isActive={activeView === 'music'}
          onClick={() => setActiveView('music')}
        />
      </div>
       <div className="p-4 border-t border-white/10 text-center text-xs text-slate-400">
        <p>&copy; 2025 - Anto Bredly</p>
      </div>
    </nav>
  );
};
