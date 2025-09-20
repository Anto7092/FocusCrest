import * as React from 'react';
import type { View } from '../types';
import { AssistantIcon, YouTubeIcon, TimerIcon, NotesIcon, MusicIcon, PlannerIcon, SettingsIcon } from './icons';

interface IconNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavIconButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const baseClasses = "relative flex items-center justify-center w-12 h-12 transition-all duration-300 ease-in-out transform rounded-lg";
  const activeClasses = "bg-[var(--accent-400)]/20 text-[var(--accent-200)]";
  const inactiveClasses = "text-[var(--text-secondary)] hover:bg-[var(--accent-500)]/10 hover:text-[var(--text-secondary)]";
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      title={label}
    >
      {/* Active state indicator bar */}
      {isActive && (
        <div 
          className="absolute left-0 top-1/4 h-1/2 w-1 bg-[var(--accent-400)] rounded-r-full"
          aria-hidden="true"
        />
      )}
      {/* Wrapper to add a drop shadow for contrast against any background */}
      <div className="[filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.8))]">
        {icon}
      </div>
    </button>
  );
};

export const Sidebar: React.FC<IconNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="flex-shrink-0 flex flex-col items-center w-20 h-full z-20">
      <div className="grid place-items-center h-20 w-full">
        {/* Added text-shadow for visibility against any background */}
        <div className="flex flex-col items-center text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
            <span className="font-bold text-sm leading-tight tracking-wider text-[var(--accent-300)]">FOCUS</span>
            <span className="text-xs leading-tight tracking-wider text-[var(--text-primary)]">CREST</span>
        </div>
      </div>
      <div className="flex flex-col flex-grow p-4 gap-4">
        <NavIconButton
          label="Study Planner"
          icon={<PlannerIcon className="w-6 h-6" />}
          isActive={activeView === 'planner'}
          onClick={() => setActiveView('planner')}
        />
        <NavIconButton
          label="AI Assistant"
          icon={<AssistantIcon className="w-6 h-6" />}
          isActive={activeView === 'assistant'}
          onClick={() => setActiveView('assistant')}
        />
        <NavIconButton
          label="EduTube"
          icon={<YouTubeIcon className="w-6 h-6" />}
          isActive={activeView === 'youtube'}
          onClick={() => setActiveView('youtube')}
        />
        <NavIconButton
          label="Pomodoro Timer"
          icon={<TimerIcon className="w-6 h-6" />}
          isActive={activeView === 'pomodoro'}
          onClick={() => setActiveView('pomodoro')}
        />
        <NavIconButton
          label="Scratch Pad"
          icon={<NotesIcon className="w-6 h-6" />}
          isActive={activeView === 'notes'}
          onClick={() => setActiveView('notes')}
        />
        <NavIconButton
          label="Focus Music"
          icon={<MusicIcon className="w-6 h-6" />}
          isActive={activeView === 'music'}
          onClick={() => setActiveView('music')}
        />
      </div>
      <div className="p-4 mt-auto">
         <NavIconButton
          label="Settings"
          icon={<SettingsIcon className="w-6 h-6" />}
          isActive={activeView === 'settings'}
          onClick={() => setActiveView('settings')}
        />
      </div>
    </nav>
  );
};