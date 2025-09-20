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
  // Base classes are separated from transform for better conditional styling.
  const baseClasses = "relative flex items-center justify-center w-14 h-14 transition-all duration-300 ease-in-out rounded-xl";
  // Active classes now include the requested glow effect using the theme's shadow variable and a subtle scale.
  const activeClasses = "bg-[var(--accent-500)]/20 text-[var(--accent-200)] shadow-[0_0_15px_var(--shadow-accent)] scale-110";
  // Inactive classes get a hover scale effect for better feedback.
  const inactiveClasses = "text-[var(--text-secondary)] hover:bg-[var(--accent-500)]/10 hover:text-[var(--text-secondary)] transform hover:scale-105";
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      title={label}
    >
      {/* The drop shadow for contrast is retained for maximum visibility. */}
      <div className="[filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.8))]">
        {icon}
      </div>
    </button>
  );
};

export const Sidebar: React.FC<IconNavProps> = ({ activeView, setActiveView }) => {
  return (
    // Increased width and padding to accommodate the new panel style.
    <nav className="flex-shrink-0 flex flex-col items-center w-24 h-full p-3 z-20">
      <div className="grid place-items-center h-20 w-full flex-shrink-0">
        <div className="flex flex-col items-center text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
            <span className="font-bold text-sm leading-tight tracking-wider text-[var(--accent-400)]">FOCUS</span>
            <span className="text-xs leading-tight tracking-wider text-[var(--text-secondary)]">CREST</span>
        </div>
      </div>
      
      {/* This new container provides the "frosted glass" effect for the icons. */}
      <div className="flex flex-col justify-between flex-grow w-full bg-black/10 backdrop-blur-md rounded-2xl border border-white/5 py-2">
        
        {/* Main navigation icons */}
        <div className="flex flex-col items-center gap-2">
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

        {/* Settings icon is pushed to the bottom by the flex container. */}
        <div className="flex flex-col items-center">
         <NavIconButton
            label="Settings"
            icon={<SettingsIcon className="w-6 h-6" />}
            isActive={activeView === 'settings'}
            onClick={() => setActiveView('settings')}
          />
        </div>
      </div>
    </nav>
  );
};