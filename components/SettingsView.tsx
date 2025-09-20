import * as React from 'react';
import type { Theme, AccentColor } from '../types';
import { SettingsIcon } from './icons';

interface SettingsViewProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
}

const ACCENT_OPTIONS: { name: AccentColor; bg: string }[] = [
  { name: 'emerald', bg: 'bg-emerald-500' },
  { name: 'sky', bg: 'bg-sky-500' },
  { name: 'rose', bg: 'bg-rose-500' },
  { name: 'violet', bg: 'bg-violet-500' },
  { name: 'amber', bg: 'bg-amber-500' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme, accentColor, setAccentColor }) => {
  return (
    <div className="flex flex-col w-full h-full bg-[var(--bg-secondary)]/20 overflow-y-auto p-6 md:p-8 text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-[var(--accent-400)]" />
            Settings
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Customize the application's appearance to fit your style.
          </p>
        </header>

        <section className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          
          {/* Theme Toggle */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Theme</label>
            <div className="relative flex w-full max-w-xs p-1 bg-[var(--bg-tertiary)] rounded-full">
              <div 
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[var(--bg-primary)] rounded-full shadow-md transition-transform duration-300 ease-in-out"
                style={{ transform: theme === 'light' ? 'translateX(0%)' : 'translateX(100%)' }}
              />
              <button
                onClick={() => setTheme('light')}
                className={`relative w-1/2 py-2 text-sm font-semibold rounded-full z-10 transition-colors ${theme === 'light' ? 'text-[var(--accent-500)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`relative w-1/2 py-2 text-sm font-semibold rounded-full z-10 transition-colors ${theme === 'dark' ? 'text-[var(--accent-500)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Dark
              </button>
            </div>
          </div>
          
          {/* Accent Color Picker */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Accent Color</label>
            <div className="flex items-center gap-4">
              {ACCENT_OPTIONS.map(({ name, bg }) => (
                <button
                  key={name}
                  onClick={() => setAccentColor(name)}
                  className={`w-10 h-10 rounded-full transition-transform transform hover:scale-110 ${bg} ${
                    accentColor === name ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-[var(--accent-400)]' : ''
                  }`}
                  aria-label={`Set accent color to ${name}`}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};