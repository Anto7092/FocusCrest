import * as React from 'react';
import { ScrollableNumberPicker } from './ScrollableNumberPicker';
import { SettingsIcon, XIcon } from './icons';
import type { DurationSettings } from '../App';

interface PomodoroSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    durations: DurationSettings;
    onDurationChange: (mode: keyof DurationSettings, value: number) => void;
}

export const PomodoroSettingsModal: React.FC<PomodoroSettingsModalProps> = ({
    isOpen,
    onClose,
    durations,
    onDurationChange,
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-backdropFadeIn"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="relative w-full max-w-lg m-4 p-8 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl border border-white/10 shadow-2xl animate-futuristicModalOpen"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                 <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10" 
                    aria-label="Close settings"
                >
                    <XIcon className="w-6 h-6" />
                </button>
                
                <div className="flex items-center justify-center gap-3 mb-4">
                    <SettingsIcon className="w-7 h-7 text-emerald-300" />
                    <h2 className="text-2xl font-bold text-slate-100">Timer Settings</h2>
                </div>
                
                <p className="text-center text-slate-400 mb-8">
                    Adjust the length of your sessions. All durations are in minutes.
                </p>

                <div className="flex justify-around items-start gap-4 text-slate-200">
                    <ScrollableNumberPicker 
                        label="Focus" 
                        value={durations.work} 
                        onChange={(newVal) => onDurationChange('work', newVal)} 
                    />
                    <ScrollableNumberPicker 
                        label="Short Break" 
                        value={durations.shortBreak} 
                        onChange={(newVal) => onDurationChange('shortBreak', newVal)} 
                    />
                    <ScrollableNumberPicker 
                        label="Long Break" 
                        value={durations.longBreak} 
                        onChange={(newVal) => onDurationChange('longBreak', newVal)} 
                    />
                </div>

                <div className="mt-10 text-center">
                    <button 
                        onClick={onClose}
                        className="px-10 py-3 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-400 transition-all duration-300 shadow-lg hover:shadow-emerald-500/40 transform hover:scale-105"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};