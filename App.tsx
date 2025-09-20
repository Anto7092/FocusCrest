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
import type { View, PomodoroState, BackgroundImage, ColorPalette } from './types';
import { MenuIcon, XIcon } from './components/icons';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { IntroAnimation } from './components/IntroAnimation';
import { getCustomBackground, deleteCustomBackground } from './services/dbService';

const SESSIONS_PER_LONG_BREAK = 4;
const POMODORO_SETTINGS_KEY = 'study-focus-pomodoro-settings';
const THEME_SETTINGS_KEY = 'study-focus-theme-settings-v2';

export const BACKGROUND_IMAGES: BackgroundImage[] = [
    {
        id: 'misty-mountain',
        name: 'Misty Mountain',
        url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=2670&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=200&h=120&auto=format&fit=crop',
        palette: {
            accent100: 'hsl(195, 40%, 96%)', accent200: 'hsl(195, 50%, 88%)', accent300: 'hsl(195, 60%, 77%)', accent400: 'hsl(195, 70%, 66%)', accent500: 'hsl(195, 80%, 56%)', accent600: 'hsl(195, 90%, 48%)',
            bgSecondary: 'rgba(12, 26, 46, 0.8)', bgTertiary: '#112233', bgQuaternary: '#1a334d',
            textPrimary: '#f0f8ff', textSecondary: '#c0d8e8', textMuted: '#809bb1',
            borderPrimary: 'rgba(45, 85, 125, 0.7)', borderSecondary: '#1a334d', shadowAccent: 'hsl(195, 80%, 56%, 0.1)',
            paperColor: 'rgba(17, 34, 51, 0.9)', lineColor: 'rgba(45, 85, 125, 0.9)', paperTextColor: '#dceefc', paperTextBold: 'hsl(195, 60%, 77%)', paperPlaceholder: '#809bb1',
            userBubbleBg: 'hsla(195, 80%, 56%, 0.2)', userBubbleText: '#f0f8ff',
            backgroundFilter: 'brightness(0.55) saturate(0.9)',
        }
    },
    {
        id: 'cozy-library',
        name: 'Cozy Library',
        url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2670&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=200&h=120&auto=format&fit=crop',
        palette: {
            accent100: 'hsl(35, 80%, 96%)', accent200: 'hsl(35, 85%, 88%)', accent300: 'hsl(35, 90%, 77%)', accent400: 'hsl(35, 95%, 66%)', accent500: 'hsl(35, 100%, 56%)', accent600: 'hsl(35, 100%, 48%)',
            bgSecondary: 'rgba(46, 32, 22, 0.8)', bgTertiary: '#3a291f', bgQuaternary: '#4f3a2d',
            textPrimary: '#fff5e6', textSecondary: '#e0d1b9', textMuted: '#a89984',
            borderPrimary: 'rgba(80, 60, 45, 0.7)', borderSecondary: '#4f3a2d', shadowAccent: 'hsl(35, 100%, 56%, 0.1)',
            paperColor: 'rgba(252, 249, 243, 0.9)', lineColor: 'rgba(224, 215, 203, 0.9)', paperTextColor: '#5c554e', paperTextBold: 'hsl(25, 60%, 45%)', paperPlaceholder: '#a8a29a',
            userBubbleBg: 'hsl(35, 90%, 96%)', userBubbleText: '#4f3a2d',
            backgroundFilter: 'brightness(0.7) saturate(1.1) contrast(1.1)',
        }
    },
    {
        id: 'peaceful-forest',
        name: 'Peaceful Forest',
        url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2670&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=200&h=120&auto=format&fit=crop',
        palette: {
            accent100: 'hsl(140, 50%, 96%)', accent200: 'hsl(140, 55%, 88%)', accent300: 'hsl(140, 60%, 77%)', accent400: 'hsl(140, 65%, 66%)', accent500: 'hsl(140, 70%, 56%)', accent600: 'hsl(140, 80%, 48%)',
            bgSecondary: 'rgba(15, 30, 20, 0.8)', bgTertiary: '#162b21', bgQuaternary: '#244234',
            textPrimary: '#e6f5ee', textSecondary: '#b9d8ca', textMuted: '#84a899',
            borderPrimary: 'rgba(45, 80, 60, 0.7)', borderSecondary: '#244234', shadowAccent: 'hsl(140, 70%, 56%, 0.1)',
            paperColor: 'rgba(22, 43, 33, 0.9)', lineColor: 'rgba(50, 90, 70, 0.9)', paperTextColor: '#d1e5db', paperTextBold: 'hsl(140, 60%, 77%)', paperPlaceholder: '#84a899',
            userBubbleBg: 'hsla(140, 70%, 56%, 0.2)', userBubbleText: '#e6f5ee',
            backgroundFilter: 'brightness(0.6) saturate(1.2)',
        }
    },
    {
        id: 'modern-desk',
        name: 'Modern Desk',
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=200&h=120&auto=format&fit=crop',
        palette: {
            accent100: 'hsl(210, 20%, 96%)', accent200: 'hsl(210, 25%, 88%)', accent300: 'hsl(210, 30%, 77%)', accent400: 'hsl(210, 40%, 66%)', accent500: 'hsl(210, 50%, 56%)', accent600: 'hsl(210, 60%, 48%)',
            bgSecondary: 'rgba(20, 22, 25, 0.85)', bgTertiary: '#1c1e22', bgQuaternary: '#2d3035',
            textPrimary: '#f5f7fa', textSecondary: '#d0d5dd', textMuted: '#98a2b3',
            borderPrimary: 'rgba(60, 65, 75, 0.7)', borderSecondary: '#2d3035', shadowAccent: 'hsl(210, 50%, 56%, 0.1)',
            paperColor: 'rgba(28, 30, 34, 0.9)', lineColor: 'rgba(70, 75, 85, 0.9)', paperTextColor: '#e4e7eb', paperTextBold: 'hsl(210, 30%, 77%)', paperPlaceholder: '#98a2b3',
            userBubbleBg: 'hsla(210, 50%, 56%, 0.2)', userBubbleText: '#f5f7fa',
            backgroundFilter: 'brightness(0.7) saturate(0.1) contrast(1.0)',
        }
    },
    {
        id: 'night-sky',
        name: 'Night Sky',
        url: 'https://images.unsplash.com/photo-1472552944129-b035e9ea3744?q=80&w=2574&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1472552944129-b035e9ea3744?q=80&w=200&h=120&auto=format&fit=crop',
        palette: {
            accent100: 'hsl(260, 60%, 96%)', accent200: 'hsl(260, 65%, 88%)', accent300: 'hsl(260, 70%, 77%)', accent400: 'hsl(260, 80%, 66%)', accent500: 'hsl(260, 90%, 56%)', accent600: 'hsl(260, 100%, 48%)',
            bgSecondary: 'rgba(20, 15, 40, 0.8)', bgTertiary: '#1f1a33', bgQuaternary: '#2e274d',
            textPrimary: '#f5f3ff', textSecondary: '#d9d2ff', textMuted: '#a399cc',
            borderPrimary: 'rgba(65, 55, 100, 0.7)', borderSecondary: '#2e274d', shadowAccent: 'hsl(260, 90%, 56%, 0.1)',
            paperColor: 'rgba(31, 26, 51, 0.9)', lineColor: 'rgba(75, 65, 110, 0.9)', paperTextColor: '#e9e6ff', paperTextBold: 'hsl(260, 70%, 77%)', paperPlaceholder: '#a399cc',
            userBubbleBg: 'hsla(260, 90%, 56%, 0.2)', userBubbleText: '#f5f3ff',
            backgroundFilter: 'brightness(0.5) saturate(1.2)',
        }
    }
];

export const CUSTOM_IMAGE_PALETTE: ColorPalette = {
    accent100: 'hsl(210, 20%, 96%)', accent200: 'hsl(210, 25%, 88%)', accent300: 'hsl(210, 30%, 77%)', accent400: 'hsl(210, 40%, 66%)', accent500: 'hsl(210, 50%, 56%)', accent600: 'hsl(210, 60%, 48%)',
    bgSecondary: 'rgba(20, 22, 25, 0.85)', bgTertiary: '#1c1e22', bgQuaternary: '#2d3035',
    textPrimary: '#f5f7fa', textSecondary: '#d0d5dd', textMuted: '#98a2b3',
    borderPrimary: 'rgba(60, 65, 75, 0.7)', borderSecondary: '#2d3035', shadowAccent: 'hsl(210, 50%, 56%, 0.1)',
    paperColor: 'rgba(28, 30, 34, 0.9)', lineColor: 'rgba(70, 75, 85, 0.9)', paperTextColor: '#e4e7eb', paperTextBold: 'hsl(210, 30%, 77%)', paperPlaceholder: '#98a2b3',
    userBubbleBg: 'hsla(210, 50%, 56%, 0.2)', userBubbleText: '#f5f7fa',
    backgroundFilter: 'brightness(0.7) saturate(0.5) contrast(1.0)',
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
  
  // Dynamic theme state
  const [selectedBackground, setSelectedBackground] = React.useState<BackgroundImage>(BACKGROUND_IMAGES[0]);
  const customBgUrlRef = React.useRef<string | null>(null);

  // Load theme from storage on initial load
  React.useEffect(() => {
    const loadTheme = async () => {
      try {
        // Prioritize loading custom background from IndexedDB
        const customBgBlob = await getCustomBackground();
        if (customBgBlob) {
          const objectUrl = URL.createObjectURL(customBgBlob);
          // Clean up old object URL if it exists
          if (customBgUrlRef.current) {
            URL.revokeObjectURL(customBgUrlRef.current);
          }
          customBgUrlRef.current = objectUrl;

          const customBackground: BackgroundImage = {
            id: 'custom',
            name: (customBgBlob as File).name || 'Custom Image',
            url: objectUrl,
            thumbnailUrl: objectUrl,
            palette: CUSTOM_IMAGE_PALETTE,
          };
          setSelectedBackground(customBackground);
          return; // Stop here if custom background is loaded
        }
        
        // Fallback to loading preset theme from localStorage
        const savedSettings = localStorage.getItem(THEME_SETTINGS_KEY);
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.backgroundId) {
            const foundBg = BACKGROUND_IMAGES.find(bg => bg.id === settings.backgroundId);
            if (foundBg) {
              setSelectedBackground(foundBg);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load theme:", e);
        // Use default theme if anything fails
      }
    };

    loadTheme();
    
    // Cleanup object URL on component unmount
    return () => {
        if (customBgUrlRef.current) {
            URL.revokeObjectURL(customBgUrlRef.current);
        }
    };
  }, []);

  // Effect to apply theme and persist choice
  React.useEffect(() => {
    const applyTheme = async () => {
      const root = document.documentElement;
      const { palette, url } = selectedBackground;

      // Apply background image and filter
      root.style.setProperty('--background-image-url', `url('${url}')`);
      root.style.setProperty('--background-filter', palette.backgroundFilter);
      
      // Apply all colors from the palette to CSS variables
      Object.entries(palette).forEach(([key, value]) => {
          const cssVarName = `--${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
          if (key !== 'backgroundFilter') {
              root.style.setProperty(cssVarName, value);
          }
      });

      // Persist choice to storage
      if (selectedBackground.id !== 'custom') {
          // If a preset is chosen, save its ID to localStorage and delete any custom background from DB
          localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify({ backgroundId: selectedBackground.id }));
          try {
              await deleteCustomBackground();
              // Clean up object URL if we are switching away from a custom bg
              if (customBgUrlRef.current) {
                  URL.revokeObjectURL(customBgUrlRef.current);
                  customBgUrlRef.current = null;
              }
          } catch (e) {
              console.error("Failed to delete custom background:", e);
          }
      } else {
          // If a custom background is active, ensure localStorage doesn't point to an old preset
          localStorage.removeItem(THEME_SETTINGS_KEY);
      }
    };

    if (selectedBackground) {
        applyTheme();
    }

  }, [selectedBackground]);


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
                <SettingsView 
                  backgroundImages={BACKGROUND_IMAGES}
                  currentBackground={selectedBackground}
                  setBackground={setSelectedBackground}
                  customImagePalette={CUSTOM_IMAGE_PALETTE}
                />
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