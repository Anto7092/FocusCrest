import * as React from 'react';
import type { BackgroundImage, ColorPalette } from '../types';
import { SettingsIcon, UploadIcon } from './icons';

interface SettingsViewProps {
  backgroundImages: BackgroundImage[];
  currentBackground: BackgroundImage;
  setBackground: (bg: BackgroundImage) => void;
  customImagePalette: ColorPalette;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ backgroundImages, currentBackground, setBackground, customImagePalette }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert("Image is too large. Please choose a file smaller than 5MB.");
          return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
          const base64Url = e.target?.result as string;
          if (base64Url) {
              const customBackground: BackgroundImage = {
                  id: 'custom',
                  name: file.name,
                  url: base64Url,
                  thumbnailUrl: base64Url,
                  palette: customImagePalette,
              };
              setBackground(customBackground);
          }
      };
      reader.readAsDataURL(file);
  };

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
                
                {currentBackground.id === 'custom' && (
                    <div className="relative rounded-lg overflow-hidden aspect-video ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-[var(--accent-400)]">
                        <img src={currentBackground.thumbnailUrl} alt={currentBackground.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40"></div>
                        <p className="absolute bottom-1 left-2 text-white text-xs font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)] truncate" title={currentBackground.name}>
                          {currentBackground.name}
                        </p>
                    </div>
                )}

                <div className="relative rounded-lg aspect-video transition-all duration-200 ring-1 ring-transparent hover:ring-[var(--border-primary)]">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 transition-colors rounded-lg"
                        aria-label="Upload a custom background image"
                    >
                        <UploadIcon className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                        <span className="text-sm text-[var(--text-secondary)] font-medium">Upload Image</span>
                    </button>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
};