import * as React from 'react';
import { Sidebar } from './components/Sidebar';
import { BrowserView as AssistantView } from './components/BrowserView';
import { MiniYouTubeView } from './components/MiniYouTubeView';
import { PomodoroView } from './components/PomodoroView';
import { NotesView } from './components/NotesView';
import { FocusMusicView } from './components/FocusMusicView';
import { PlannerView } from './components/PlannerView';
import { SettingsView } from './components/SettingsView';
import { GlobalControls } from './components/GlobalControls';
import type { View, PomodoroState, Theme, AccentColor } from './types';
import { MenuIcon, XIcon } from './components/icons';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { IntroAnimation } from './components/IntroAnimation';

const SESSIONS_PER_LONG_BREAK = 4;
const POMODORO_SETTINGS_KEY = 'study-focus-pomodoro-settings';
const THEME_SETTINGS_KEY = 'study-focus-theme-settings';

const ACCENT_COLORS: Record<AccentColor, { h: number; s: string }> = {
  emerald: { h: 158, s: '64%' },
  sky:     { h: 199, s: '89%' },
  rose:    { h: 347, s: '90%' },
  violet:  { h: 262, s: '85%' },
  amber:   { h: 43,  s: '96%' },
};

export type DurationSettings = {
    work: number;
    shortBreak: number;
    longBreak: number;
};

// Wrapper component to preserve view state by hiding/showing instead of mounting/unmounting
const ViewWrapper: React.FC<{ id: View, activeView: View, children: React.ReactNode }> = ({ id, activeView, children }) => {
    const isVisible = activeView === id;
    return (
      <div style={{ display: isVisible ? 'block' : 'none', height: '100%', width: '100%' }} className={isVisible ? 'animate-viewFadeIn' : ''}>
        {children}
      </div>
    );
};

const App: React.FC = () => {
  const [showIntroComponent, setShowIntroComponent] = React.useState(true);
  const [startTransition, setStartTransition] = React.useState(false);
  const [activeView, setActiveView] = React.useState<View>('planner');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  
  // State for planner-to-component communication
  const [initialYouTubeQuery, setInitialYouTubeQuery] = React.useState<string | null>(null);
  const [initialAssistantQuery, setInitialAssistantQuery] = React.useState<string | null>(null);
  
  // Theme state
  const [theme, setTheme] = React.useState<Theme>('dark');
  const [accentColor, setAccentColor] = React.useState<AccentColor>('emerald');
  
  // Load and apply theme from localStorage on initial load
  React.useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_SETTINGS_KEY);
      if (savedTheme) {
        const { theme: saved, accent: savedAccent } = JSON.parse(savedTheme);
        if (saved) setTheme(saved);
        if (savedAccent) setAccentColor(savedAccent);
      }
    } catch {
      // Use default theme if parsing fails
    }
  }, []);

  // Effect to apply theme classes and CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${theme}`);

    const accent = ACCENT_COLORS[accentColor];
    if (accent) {
      root.style.setProperty('--color-accent-h', accent.h.toString());
      root.style.setProperty('--color-accent-s', accent.s);
    }
    
    // Persist theme choice to localStorage
    localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify({ theme, accent: accentColor }));
  }, [theme, accentColor]);

  // Global Pomodoro State
  const [pomodoroDurations, setPomodoroDurations] = React.useState<DurationSettings>(() => {
    try {
        const saved = localStorage.getItem(POMODORO_SETTINGS_KEY);
        return saved ? JSON.parse(saved) : { work: 25, shortBreak: 5, longBreak: 15 };
    } catch {
        return { work: 25, shortBreak: 5, longBreak: 15 };
    }
  });
  const [pomodoroState, setPomodoroState] = React.useState<PomodoroState>({
    isActive: false,
    mode: 'work',
    timeLeft: pomodoroDurations.work * 60,
    sessions: 0,
    sessionName: '',
  });

  React.useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (pomodoroState.isActive && pomodoroState.timeLeft > 0) {
      timer = setInterval(() => {
        setPomodoroState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (pomodoroState.isActive && pomodoroState.timeLeft === 0) {
        const newSessions = pomodoroState.mode === 'work' ? pomodoroState.sessions + 1 : pomodoroState.sessions;
        const nextMode = pomodoroState.mode === 'work'
          ? (newSessions > 0 && newSessions % SESSIONS_PER_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak')
          : 'work';
        
        const durationMap = { work: pomodoroDurations.work, shortBreak: pomodoroDurations.shortBreak, longBreak: pomodoroDurations.longBreak };
        setPomodoroState(prev => ({ ...prev, isActive: false, mode: nextMode, sessions: newSessions, timeLeft: durationMap[nextMode] * 60 }));
    }
    return () => { if (timer) clearInterval(timer); };
  }, [pomodoroState.isActive, pomodoroState.timeLeft, pomodoroDurations]);
  
  React.useEffect(() => {
    localStorage.setItem(POMODORO_SETTINGS_KEY, JSON.stringify(pomodoroDurations));
  }, [pomodoroDurations]);

  React.useEffect(() => {
    const handleNotesUpdate = () => setActiveView('notes');
    window.addEventListener('notes-updated', handleNotesUpdate);
    return () => window.removeEventListener('notes-updated', handleNotesUpdate);
  }, []);
  
  const handleIntroAnimationEnd = () => {
    setStartTransition(true);
    setTimeout(() => setShowIntroComponent(false), 800);
  };

  const handleSetView = React.useCallback((view: View) => setActiveView(view), []);
  
  const handleStartYouTubeSearch = (query: string) => { setInitialYouTubeQuery(query); setActiveView('youtube'); };
  const handleStartPomodoro = (sessionName: string) => {
    setPomodoroState(prev => ({ ...prev, isActive: true, mode: 'work', timeLeft: pomodoroDurations.work * 60, sessionName }));
    setActiveView('pomodoro');
  };
  const handleAskAssistant = (query: string) => { setInitialAssistantQuery(query); setActiveView('assistant'); };

  const fullDuration = pomodoroDurations[pomodoroState.mode] * 60;
  const showGlobalControls = pomodoroState.timeLeft < fullDuration;

  return (
     <>
      {showIntroComponent && <IntroAnimation onComplete={handleIntroAnimationEnd} isTransitioning={startTransition} />}
      <div className={`
        flex h-screen bg-[var(--bg-primary)] font-sans texture-overlay overflow-x-hidden
        ${startTransition ? 'animate-fadeIn' : 'opacity-0'}
      `}>
        <Sidebar 
          activeView={activeView} 
          setActiveView={handleSetView} 
          isSidebarOpen={isSidebarOpen}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 flex min-h-0 relative">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="absolute top-5 left-5 z-30 p-2 bg-[var(--bg-tertiary)]/[.5] rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-quaternary)]/[.5] hover:text-[var(--text-primary)] transition-all"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
            <div className="w-full flex-1 min-h-0">
              <ViewWrapper id="planner" activeView={activeView}>
                <PlannerView onYouTubeSearch={handleStartYouTubeSearch} onPomodoroStart={handleStartPomodoro} onAssistantAsk={handleAskAssistant} />
              </ViewWrapper>
              <ViewWrapper id="assistant" activeView={activeView}>
                <AssistantView initialQuery={initialAssistantQuery} onQueryHandled={() => setInitialAssistantQuery(null)} />
              </ViewWrapper>
              <ViewWrapper id="youtube" activeView={activeView}>
                <MiniYouTubeView initialQuery={initialYouTubeQuery} onSearchHandled={() => setInitialYouTubeQuery(null)} />
              </ViewWrapper>
              <ViewWrapper id="pomodoro" activeView={activeView}>
                <PomodoroView durations={pomodoroDurations} setDurations={setPomodoroDurations} globalState={pomodoroState} setGlobalState={setPomodoroState} />
              </ViewWrapper>
              <ViewWrapper id="music" activeView={activeView}>
                <FocusMusicView />
              </ViewWrapper>
              <ViewWrapper id="notes" activeView={activeView}>
                <NotesView />
              </ViewWrapper>
              <ViewWrapper id="settings" activeView={activeView}>
                <SettingsView theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} />
              </ViewWrapper>
            </div>
          </main>
          {showGlobalControls && (
            <GlobalControls pomodoroState={pomodoroState} setPomodoroState={setPomodoroState} durations={pomodoroDurations} />
          )}
        </div>
      </div>
    </>
  );
};

export default App;