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
import type { View, PomodoroState, BackgroundImage, ColorPalette, PomodoroSettings, NotificationSound } from './types';
import { MenuIcon, XIcon } from './components/icons';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { IntroAnimation } from './components/IntroAnimation';
import { getCustomBackground, deleteCustomBackground } from './services/dbService';

const SESSIONS_PER_LONG_BREAK = 4;
const POMODORO_SETTINGS_KEY = 'study-focus-pomodoro-settings-v2'; // Updated key
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

export const NOTIFICATION_SOUNDS: NotificationSound[] = [
    { id: 'none', name: 'None', url: '' },
    { id: 'bell', name: 'Bell', url: 'data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhJAEAAAD///////9w/3r/cv9u/3T/eP95/3b/av9y/3n/gv+C/3//cf9u/3P/gP+H/4f/f/90/3T/hP+P/5L/kv+L/4T/gv+I/5D/mv+f/5n/lf+T/5f/nP+j/6j/qP+l/6X/pv+n/6v/s/+3/7f/tP+w/6z/r/+5/7//wP/B/8H/v//A/8H/xf/H/8f/w//C/8P/xP/G/8f/yP/J/8n/yP/I/8j/yv/N/8//z//O/83/zf/P/9H/0f/R/8//zv/Q/9L/1A/U/9P/0//V/9f/1//W/9X/1f/X/9j/2v/c/9z/2f/Y/9n/2v/d/9//4P/g/+D/3//f/9//4P/i/+T/5f/l/+T/4v/i/+T/5v/o/+n/6f/o/+f/5//p/+r/7P/u/+//7v/t/+z/7P/t/+//8P/yP/S/9T/1//Y/9r/3P/e/+D/4v/k/+X/5v/o/+n/6v/s/+3/7v/v//A/8X/yP/Q/9T/1//Y/9r/3P/e/+D/4v/k/+b/6P/q/+z/7v/wP/H/8//1//Z/9z/4f/m/+v/8P/y//X/+/8A/wH/Af/+/+7/7v/v//L/9f/6//z//f/9//7/AQIEBgQHBAcGBgYGBgYIBwkKDA0NDgwMCwoKCQkJCgoMCw0ODw8PDw4NDAsKCQgHBgUEAwIBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//v8=' },
    { id: 'chime', name: 'Chime', url: 'data:audio/wav;base64,UklGRmACAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhQACAAGN/iv+V/8b/6v8A/3b7ifpT9W/zI/Of64/gb73/Z/2N/Mv+QAIoB6wJ0gq2DOYOUg9qECQP6g6uCrQJHAecAPn/G/7T/mECIAhSCcMLxQ+tExoVohcNGGYY8hhpF7oTqxA8C0gH5f7N+4P3E/fJ+Kn6V/v0ADgD4gfyCgMOQhCPEJYR+hBHDUII4f3e+jb1k/FT6s/lV+PX32/cn95P6T/7YAFgENgrDDsUSwhgEJAQ+g3GCgAHy/uX8evvh/oY/LD81f0N/e//pQGuBdcKMQ8iFTcaZSJjJ7woHCisJ4kflhqyEgQLpfi36g/p6+3f8G/6//3zAVgHpg2rF10dSSM8KN8qcS2zLnstgikyH7sYlRKHCn3/Q/tb+1X+4QG4BzMNoRVjGzIgyyR8Jz4qlyrHKbYm9yE3GB4P5/xL85nzn/gv+vP+WQK8CK8NlxZlHMci7CTSKOQpBylnJtQheiAQEfsJ2wP0/wX/6f40/aX+4QJUCQYQJRhOJ3wy2jPRNW422jLxK+og/BP5Af786eHi3d3f4OPk6uvv9Pf5+/8AByQRRixONlU8YT8/RjBIfElRSWlGqUQhQjM+OTc3OEM4P0RAREhMTlJYWV1cYGZrbHF0eX2AhIqNkJOWm5+jpquusbS4u8HCyMvP0tXY3uHk6u3w9fn8//8=' },
    { id: 'digital', name: 'Digital', url: 'data:audio/wav;base64,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'] },
];

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
  const [pomodoroSettings, setPomodoroSettings] = React.useState<PomodoroSettings>(() => {
    try {
        const saved = localStorage.getItem(POMODORO_SETTINGS_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
    } catch {
       // Fallback on error
    }
    return { 
        durations: { work: 25, shortBreak: 5, longBreak: 15 },
        soundId: 'bell' // Default sound
    };
  });
  
  const [pomodoroState, setPomodoroState] = React.useState<PomodoroState>({
    isActive: false,
    mode: 'work',
    timeLeft: pomodoroSettings.durations.work * 60,
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
        // Play notification sound
        const sound = NOTIFICATION_SOUNDS.find(s => s.id === pomodoroSettings.soundId);
        if (sound && sound.url) {
            const audio = new Audio(sound.url);
            audio.play().catch(e => console.error("Error playing sound:", e));
        }

        const newSessions = pomodoroState.mode === 'work' ? pomodoroState.sessions + 1 : pomodoroState.sessions;
        const nextMode = pomodoroState.mode === 'work'
          ? (newSessions > 0 && newSessions % SESSIONS_PER_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak')
          : 'work';
        
        const durationMap = pomodoroSettings.durations;
        setPomodoroState(prev => ({ ...prev, isActive: false, mode: nextMode, sessions: newSessions, timeLeft: durationMap[nextMode] * 60 }));
    }
    return () => { if (timer) clearInterval(timer); };
  }, [pomodoroState.isActive, pomodoroState.timeLeft, pomodoroSettings]);
  
  React.useEffect(() => {
    localStorage.setItem(POMODORO_SETTINGS_KEY, JSON.stringify(pomodoroSettings));
  }, [pomodoroSettings]);

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
    setPomodoroState(prev => ({ ...prev, isActive: true, mode: 'work', timeLeft: pomodoroSettings.durations.work * 60, sessionName }));
    setActiveView('pomodoro');
  };
  const handleAskAssistant = (query: string) => { setInitialAssistantQuery(query); setActiveView('assistant'); };

  const fullDuration = pomodoroSettings.durations[pomodoroState.mode] * 60;
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
                <PomodoroView 
                    settings={pomodoroSettings}
                    setSettings={setPomodoroSettings}
                    globalState={pomodoroState}
                    setGlobalState={setPomodoroState}
                    sounds={NOTIFICATION_SOUNDS}
                />
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
          {showGlobalControls && activeView !== 'pomodoro' && (
            <GlobalControls pomodoroState={pomodoroState} setPomodoroState={setPomodoroState} durations={pomodoroSettings.durations} />
          )}
        </div>
      </div>
    </>
  );
};

export default App;
