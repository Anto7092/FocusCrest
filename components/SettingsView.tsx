import * as React from 'react';
import type { BackgroundImage } from '../types';
import { SettingsIcon } from './icons';

interface SettingsViewProps {
  backgroundImages: BackgroundImage[];
  currentBackground: BackgroundImage;
  setBackground: (bg: BackgroundImage) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ backgroundImages, currentBackground, setBackground }) => {
  return (
    <div className="flex flex-col w-full h-full overflow-y-auto p-6 md:p-8 text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-[var(--accent-400)]" />
            Appearance Settings
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Change the background to dynamically update the entire application's color scheme.
          </p>
        </header>

        <section className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Background & Theme</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {backgroundImages.map((image) => (
                <button
                    key={image.id}
                    onClick={() => setBackground(image)}
                    className={`relative rounded-lg overflow-hidden aspect-video transition-all duration-200 transform hover:scale-105 focus:outline-none group ${
                    currentBackground.id === image.id ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-[var(--accent-400)]' : 'ring-1 ring-transparent hover:ring-[var(--border-secondary)]'
                    }`}
                    aria-label={`Set background to ${image.name}`}
                    aria-pressed={currentBackground.id === image.id}
                >
                    <img src={image.thumbnailUrl} alt={image.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                    <p className="absolute bottom-1 left-2 text-white text-xs font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]">{image.name}</p>
                </button>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
};
