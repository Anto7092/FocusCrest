import React, { useState, useCallback } from 'react';
import { PlayIcon, PauseIcon, ResetIcon, InfoIcon, SettingsIcon } from './icons';
import { PomodoroSettingsModal } from './PomodoroSettingsModal';
import type { PomodoroState } from '../types';
import type { DurationSettings } from '../App';

interface PomodoroViewProps {
    durations: DurationSettings;
    setDurations: (durations: DurationSettings) => void;
    globalState: PomodoroState;
    setGlobalState: (state: PomodoroState | ((prevState: PomodoroState) => PomodoroState)) => void;
}

export const PomodoroView: React.FC<PomodoroViewProps> = ({
    durations,
    setDurations,
    globalState,
    setGlobalState,
}) => {
    const { isActive, mode, timeLeft, sessionName } = globalState;
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const getDuration = useCallback((currentMode: PomodoroState['mode']): number => {
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

    const handleDurationChange = (modeToChange: keyof DurationSettings, newMins: number) => {
        if (newMins > 0 && newMins <= 180) { // Cap at 180 mins
            const newDurations = { ...durations, [modeToChange]: newMins };
            setDurations(newDurations);

            if (mode === modeToChange && !isActive) {
                setGlobalState(prev => ({ ...prev, timeLeft: newMins * 60 }));
            }
        }
    };
    
    const handleSessionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalState(prev => ({...prev, sessionName: e.target.value}));
    };

    const progress = (getDuration(mode) - timeLeft) / getDuration(mode);
    
    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 text-slate-100">
            <h1 className="text-3xl font-bold text-slate-200 mb-4">
                Pomodoro <span className="text-emerald-300">Timer</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-300 mb-6 text-sm text-center">
              <InfoIcon className="w-4 h-4 flex-shrink-0" />
              <p>Boost your productivity by working in focused intervals.</p>
            </div>
            
            <div className="w-full max-w-sm mb-8">
                <input
                    type="text"
                    value={sessionName}
                    onChange={handleSessionNameChange}
                    placeholder="Name your focus session..."
                    className="w-full px-4 py-2 text-center bg-slate-900/30 text-slate-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 transition-all"
                    aria-label="Focus session name"
                />
            </div>

            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex flex-col items-center justify-center rounded-full bg-slate-900/40 shadow-2xl border-4 border-slate-700/50">
                <div className="absolute inset-0">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="stroke-current text-slate-700/50" strokeWidth="4" cx="50" cy="50" r="48" fill="transparent" />
                        <circle
                            className="stroke-current text-emerald-400 transform -rotate-90 origin-center transition-all duration-500"
                            strokeWidth="4"
                            strokeLinecap="round"
                            cx="50" cy="50" r="48"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 48}
                            strokeDashoffset={2 * Math.PI * 48 * (1 - progress)}
                        />
                    </svg>
                </div>

                <div className="z-10 text-center">
                    <p className="text-5xl sm:text-6xl font-mono font-bold tracking-widest">{formatTime(timeLeft)}</p>
                    <p className="text-md sm:text-lg text-slate-300 mt-2">{getModeLabel(mode)}</p>
                </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 mt-8 sm:mt-10">
                 <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-slate-700/50 rounded-full hover:bg-slate-600/50 transition-colors shadow-md text-slate-300"
                    aria-label="Customize durations"
                >
                    <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
                <button 
                    onClick={toggleTimer} 
                    className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg hover:shadow-xl text-white"
                    aria-label={isActive ? 'Pause timer' : 'Start timer'}
                >
                    {isActive ? <PauseIcon className="w-9 h-9 sm:w-10 sm:h-10" /> : <PlayIcon className="w-9 h-9 sm:w-10 sm:h-10" />}
                </button>
                <button 
                    onClick={resetTimer} 
                    className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-slate-700/50 rounded-full hover:bg-slate-600/50 transition-colors shadow-md text-slate-300"
                    aria-label="Reset timer"
                >
                    <ResetIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
            </div>
            
             <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button 
                    onClick={() => selectMode('work')} 
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'work' ? 'bg-emerald-400/20 text-emerald-200' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}
                >
                    Focus ({durations.work} min)
                </button>
                 <button 
                    onClick={() => selectMode('shortBreak')} 
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'shortBreak' ? 'bg-emerald-400/20 text-emerald-200' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}
                >
                    Short Break ({durations.shortBreak} min)
                </button>
                 <button 
                    onClick={() => selectMode('longBreak')} 
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'longBreak' ? 'bg-emerald-400/20 text-emerald-200' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}
                >
                    Long Break ({durations.longBreak} min)
                </button>
            </div>

            <PomodoroSettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                durations={durations}
                onDurationChange={handleDurationChange}
            />
        </div>
    );
};