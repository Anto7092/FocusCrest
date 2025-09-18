import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BrowserView as AssistantView } from './components/BrowserView';
import { MiniYouTubeView } from './components/MiniYouTubeView';
import { PomodoroView } from './components/PomodoroView';
import { NotesView } from './components/NotesView';
import { FocusMusicView } from './components/FocusMusicView';
import { GlobalControls } from './components/GlobalControls';
import type { View, PomodoroState } from './types';
import { MenuIcon, XIcon } from './components/icons';

const SESSIONS_PER_LONG_BREAK = 4;
const POMODORO_SETTINGS_KEY = 'study-focus-pomodoro-settings';

export type DurationSettings = {
    work: number;
    shortBreak: number;
    longBreak: number;
};

// Wrapper component to preserve view state by hiding/showing instead of mounting/unmounting
const ViewWrapper: React.FC<{ id: View, activeView: View, children: React.ReactNode }> = ({ id, activeView, children }) => {
    const isVisible = activeView === id;
    return (
      <div style={{ display: isVisible ? 'block' : 'none', height: '100%', width: '100%' }} className={isVisible ? 'animate-dynamicViewTransition' : ''}>
        {children}
      </div>
    );
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('assistant');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Global Pomodoro State
  const [pomodoroDurations, setPomodoroDurations] = useState<DurationSettings>(() => {
    try {
        const saved = localStorage.getItem(POMODORO_SETTINGS_KEY);
        return saved ? JSON.parse(saved) : { work: 25, shortBreak: 5, longBreak: 15 };
    } catch {
        return { work: 25, shortBreak: 5, longBreak: 15 };
    }
  });
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    isActive: false,
    mode: 'work',
    timeLeft: pomodoroDurations.work * 60,
    sessions: 0,
    sessionName: '',
  });

  // Pomodoro Timer Logic (now global)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const switchMode = () => {
      setPomodoroState(prev => {
        const newSessions = prev.mode === 'work' ? prev.sessions + 1 : prev.sessions;
        const nextMode = prev.mode === 'work'
          ? (newSessions > 0 && newSessions % SESSIONS_PER_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak')
          : 'work';
        
        const durationMap = {
          work: pomodoroDurations.work * 60,
          shortBreak: pomodoroDurations.shortBreak * 60,
          longBreak: pomodoroDurations.longBreak * 60,
        };

        return {
          ...prev,
          isActive: false, // Should pause after switching
          mode: nextMode,
          sessions: newSessions,
          timeLeft: durationMap[nextMode],
        };
      });
    };

    if (pomodoroState.isActive && pomodoroState.timeLeft > 0) {
      timer = setInterval(() => {
        setPomodoroState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (pomodoroState.isActive && pomodoroState.timeLeft === 0) {
      switchMode();
    }
    return () => { if (timer) clearInterval(timer); };
  }, [pomodoroState.isActive, pomodoroState.timeLeft, pomodoroDurations]);
  
  // Persist Pomodoro Durations to localStorage.
  useEffect(() => {
    localStorage.setItem(POMODORO_SETTINGS_KEY, JSON.stringify(pomodoroDurations));
  }, [pomodoroDurations]);

  // Listen for 'notes-updated' event to switch to the notes view automatically.
  useEffect(() => {
    const handleNotesUpdate = () => {
        setActiveView('notes');
    };
    window.addEventListener('notes-updated', handleNotesUpdate);
    return () => {
        window.removeEventListener('notes-updated', handleNotesUpdate);
    };
  }, []);
  

  const handleSetView = useCallback((view: View) => {
    setActiveView(view);
  }, []);

  const fullDuration = pomodoroDurations[pomodoroState.mode] * 60;
  // A session is in progress if the timer has been started (and timeLeft is less than full).
  const showGlobalControls = pomodoroState.timeLeft < fullDuration;

  return (
    <div className="flex h-screen bg-slate-950/20 font-sans texture-overlay overflow-x-hidden">
      <Sidebar 
        activeView={activeView} 
        setActiveView={handleSetView} 
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 flex min-h-0 relative">
           <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-5 left-5 z-30 p-2 bg-slate-800/50 rounded-md text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
          <div className="w-full flex-1 min-h-0">
            <ViewWrapper id="assistant" activeView={activeView}><AssistantView /></ViewWrapper>
            <ViewWrapper id="youtube" activeView={activeView}><MiniYouTubeView /></ViewWrapper>
            <ViewWrapper id="pomodoro" activeView={activeView}>
              <PomodoroView 
                  durations={pomodoroDurations}
                  setDurations={setPomodoroDurations}
                  globalState={pomodoroState}
                  setGlobalState={setPomodoroState}
               />
            </ViewWrapper>
            <ViewWrapper id="music" activeView={activeView}>
              <FocusMusicView />
            </ViewWrapper>
             <ViewWrapper id="notes" activeView={activeView}>
              <NotesView />
            </ViewWrapper>
          </div>
        </main>
        {showGlobalControls && (
          <GlobalControls 
            pomodoroState={pomodoroState}
            setPomodoroState={setPomodoroState}
            durations={pomodoroDurations}
          />
        )}
      </div>
    </div>
  );
};

export default App;