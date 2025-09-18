import React from 'react';
import type { PomodoroState } from '../types';
import { TimerIcon, PlayIcon, PauseIcon, XIcon } from './icons';
import type { DurationSettings } from '../App';

interface GlobalControlsProps {
    pomodoroState: PomodoroState;
    setPomodoroState: (state: PomodoroState | ((prevState: PomodoroState) => PomodoroState)) => void;
    durations: DurationSettings;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const PomodoroWidget: React.FC<{
    state: PomodoroState;
    setState: (state: PomodoroState | ((prevState: PomodoroState) => PomodoroState)) => void;
    durations: DurationSettings;
}> = ({ state, setState, durations }) => {
    const { isActive, mode, timeLeft, sessionName } = state;
    const modeLabel = mode.replace('B', ' B');
    
    const toggleTimer = () => setState(prev => ({...prev, isActive: !prev.isActive}));
    
    const cancelSession = () => setState(prev => ({
        ...prev, 
        isActive: false,
        timeLeft: durations[prev.mode] * 60,
    }));
    
    const primaryLabel = sessionName || modeLabel;
    const secondaryLabel = sessionName ? modeLabel : null;

    return (
        <div className="flex items-center gap-4 bg-slate-700/50 p-2 rounded-lg">
            <TimerIcon className="w-6 h-6 text-emerald-300 flex-shrink-0 ml-2" />
            <div className="flex-grow flex flex-col text-left min-w-[120px]">
                <span className="font-semibold text-sm text-white truncate" title={primaryLabel}>
                    {primaryLabel}
                </span>
                {secondaryLabel && <span className="text-xs text-slate-300 capitalize">{secondaryLabel}</span>}
            </div>
            <div className="flex-shrink-0 font-mono text-xl font-bold text-white pr-2 border-r border-slate-600">
                {formatTime(timeLeft)}
            </div>
            <button onClick={toggleTimer} className="p-2 text-white hover:bg-white/10 rounded-full" aria-label={isActive ? 'Pause timer' : 'Start timer'}>
                {isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </button>
             <button onClick={cancelSession} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full" aria-label="Cancel Session">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
    );
};


export const GlobalControls: React.FC<GlobalControlsProps> = ({
    pomodoroState,
    setPomodoroState,
    durations,
}) => {
    return (
        <footer className="flex-shrink-0 w-full bg-slate-900/60 backdrop-blur-lg border-t border-white/10 p-2 flex items-center justify-center md:justify-end gap-4 z-20">
            <PomodoroWidget 
                state={pomodoroState} 
                setState={setPomodoroState}
                durations={durations}
            />
        </footer>
    );
};
