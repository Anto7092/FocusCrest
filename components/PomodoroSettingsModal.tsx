import * as React from 'react';
import { ScrollableNumberPicker } from './ScrollableNumberPicker';
import { SettingsIcon, XIcon } from './icons';
import type { PomodoroSettings, NotificationSound } from '../types';

interface PomodoroSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: PomodoroSettings;
    onSettingsChange: (newSettings: PomodoroSettings) => void;
    sounds: NotificationSound[];
}

export const PomodoroSettingsModal: React.FC<PomodoroSettingsModalProps> = ({
    isOpen,
    onClose,
    settings,
    onSettingsChange,
    sounds,
}) => {
    if (!isOpen) return null;
    
    const handleDurationChange = (mode: keyof PomodoroSettings['durations'], value: number) => {
        const newSettings = {
            ...settings,
            durations: {
                ...settings.durations,
                [mode]: value,
            }
        };
        onSettingsChange(newSettings);
    };

    const handleSoundChange = (sound: NotificationSound) => {
        // Play a preview of the sound on selection
        if (sound.url) {
            const audio = new Audio(sound.url);
            audio.play().catch(e => console.error("Sound preview failed", e));
        }
        
        const newSettings = { ...settings, soundId: sound.id };
        onSettingsChange(newSettings);
    };

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
                    className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-10" 
                    aria-label="Close settings"
                >
                    <XIcon className="w-6 h-6" />
                </button>
                
                <div className="flex items-center justify-center gap-3 mb-4">
                    <SettingsIcon className="w-7 h-7 text-[var(--accent-300)]" />
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Timer Settings</h2>
                </div>
                
                <p className="text-center text-[var(--text-secondary)] mb-8">
                    Adjust the length of your sessions and the notification sound.
                </p>

                <div className="flex justify-around items-start gap-4">
                    <ScrollableNumberPicker 
                        label="Focus" 
                        value={settings.durations.work} 
                        onChange={(newVal) => handleDurationChange('work', newVal)} 
                    />
                    <ScrollableNumberPicker 
                        label="Short Break" 
                        value={settings.durations.shortBreak} 
                        onChange={(newVal) => handleDurationChange('shortBreak', newVal)} 
                    />
                    <ScrollableNumberPicker 
                        label="Long Break" 
                        value={settings.durations.longBreak} 
                        onChange={(newVal) => handleDurationChange('longBreak', newVal)} 
                    />
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <h3 className="text-center text-sm font-medium text-[var(--text-secondary)] mb-4">Notification Sound</h3>
                    <div className="flex justify-center items-center gap-3">
                        {sounds.map(sound => (
                            <button
                                key={sound.id}
                                onClick={() => handleSoundChange(sound)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                                    settings.soundId === sound.id 
                                        ? 'bg-[var(--accent-400)]/20 text-[var(--accent-200)]' 
                                        : 'bg-slate-700/50 text-[var(--text-secondary)] hover:bg-slate-600/50'
                                }`}
                                aria-pressed={settings.soundId === sound.id}
                            >
                                {sound.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <button 
                        onClick={onClose}
                        className="px-10 py-3 bg-[var(--accent-500)] text-white font-semibold rounded-full hover:bg-[var(--accent-400)] transition-all duration-300 shadow-lg hover:shadow-[0_8px_20px_-5px_hsl(var(--color-accent-h),var(--color-accent-s),var(--color-accent-l-500),0.4)] transform hover:scale-105"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
