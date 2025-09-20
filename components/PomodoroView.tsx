import * as React from 'react';
import { PlayIcon, PauseIcon, ResetIcon, InfoIcon, SettingsIcon } from './icons';
import { PomodoroSettingsModal } from './PomodoroSettingsModal';
import type { PomodoroState, PomodoroSettings, NotificationSound } from '../types';

interface PomodoroViewProps {
    settings: PomodoroSettings;
    setSettings: (settings: PomodoroSettings) => void;
    globalState: PomodoroState;
    setGlobalState: (state: PomodoroState | ((prevState: PomodoroState) => PomodoroState)) => void;
    sounds: NotificationSound[];
}

export const PomodoroView: React.FC<PomodoroViewProps> = ({
    settings,
    setSettings,
    globalState,
    setGlobalState,
    sounds,
}) => {
    const { isActive, mode, timeLeft, sessionName } = globalState;
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const { durations } = settings;

    const getDuration = React.useCallback((currentMode: PomodoroState['mode']): number => {
        return (durations[currentMode] || durations.work) * 60;
    }, [durations]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };
    
    const getModeLabel = (currentMode: PomodoroState['mode']) => {
        switch (currentMode) {
            case 'work': return 'Focus Session';
            case 'shortBreak': return 'Short Break';
            case 'longBreak': return 'Long Break';
        }
    };

    const toggleTimer = () => {
        setGlobalState(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const resetTimer = () => {
        setGlobalState(prev => ({
            ...prev,
            isActive: false,
            timeLeft: getDuration(prev.mode),
        }));
    };

    const selectMode = (newMode: PomodoroState['mode']) => {
        setGlobalState(prev => ({
            ...prev,
            isActive: false,
            mode: newMode,
            timeLeft: durations[newMode] * 60,
            sessions: newMode === 'work' ? 0 : prev.sessions,
        }));
    };

    const handleSettingsChange = (newSettings: PomodoroSettings) => {
        setSettings(newSettings);
        // If the current mode's duration was changed and the timer isn't running, update timeLeft
        if (mode in newSettings.durations && !isActive) {
            if (newSettings.durations[mode] !== durations[mode]) {
                 setGlobalState(prev => ({ ...prev, timeLeft: newSettings.durations[mode] * 60 }));
            }
        }
    };
    
    const handleSessionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalState(prev => ({...prev, sessionName: e.target.value}));
    };
    
    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 text-[var(--text-primary)]">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                Pomodoro <span className="text-[var(--accent-300)]">Timer</span>
            </h1>
            <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-6 text-sm">
              <InfoIcon className="w-4 h-4" />
              <p>Boost your productivity by working in focused intervals.</p>
            </div>
            
            <div className="w-full max-w-sm mb-8">
                <input
                    type="text"
                    value={sessionName}
                    onChange={handleSessionNameChange}
                    placeholder="Name your focus session..."
                    className="w-full px-4 py-2 text-center bg-slate-900/30 text-[var(--text-primary)] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)] placeholder:text-[var(--text-muted)] transition-all"
                    aria-label="Focus session name"
                />
            </div>

            <div className="text-center my-12">
                <p className="text-9xl font-mono font-bold tracking-widest">{formatTime(timeLeft)}</p>
                <p className="text-xl text-[var(--text-secondary)] mt-2">{getModeLabel(mode)}</p>
            </div>

            <div className="flex items-center space-x-4">
                 <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-16 h-16 flex items-center justify-center bg-slate-700/50 rounded-full hover:bg-slate-600/50 transition-colors shadow-md text-[var(--text-secondary)]"
                    aria-label="Customize durations"
                >
                    <SettingsIcon className="w-8 h-8" />
                </button>
                <button 
                    onClick={toggleTimer} 
                    className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] rounded-full hover:from-[var(--accent-400)] hover:to-[var(--accent-500)] transition-all shadow-lg hover:shadow-xl text-white"
                    aria-label={isActive ? 'Pause timer' : 'Start timer'}
                >
                    {isActive ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}
                </button>
                <button 
                    onClick={resetTimer} 
                    className="w-16 h-16 flex items-center justify-center bg-slate-700/50 rounded-full hover:bg-slate-600/50 transition-colors shadow-md text-[var(--text-secondary)]"
                    aria-label="Reset timer"
                >
                    <ResetIcon className="w-8 h-8" />
                </button>
            </div>
            
             <div className="mt-12 flex space-x-4">
                <button 
                    onClick={() => selectMode('work')} 
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'work' ? 'bg-[var(--accent-400)]/20 text-[var(--accent-200)]' : 'bg-slate-700/50 text-[var(--text-secondary)] hover:bg-slate-600/50'}`}
                >
                    Focus ({durations.work} min)
                </button>
                 <button 
                    onClick={() => selectMode('shortBreak')} 
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'shortBreak' ? 'bg-[var(--accent-400)]/20 text-[var(--accent-200)]' : 'bg-slate-700/50 text-[var(--text-secondary)] hover:bg-slate-600/50'}`}
                >
                    Short Break ({durations.shortBreak} min)
                </button>
                 <button 
                    onClick={() => selectMode('longBreak')} 
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'longBreak' ? 'bg-[var(--accent-400)]/20 text-[var(--accent-200)]' : 'bg-slate-700/50 text-[var(--text-secondary)] hover:bg-slate-600/50'}`}
                >
                    Long Break ({durations.longBreak} min)
                </button>
            </div>

            <PomodoroSettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSettingsChange={handleSettingsChange}
                sounds={sounds}
            />
        </div>
    );
};
