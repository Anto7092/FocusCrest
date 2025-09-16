import React from 'react';
import { MusicIcon, ErrorIcon } from './icons';

export const FocusMusicView: React.FC = () => {
    return (
        <div className="flex flex-col w-full h-full bg-slate-900/20 overflow-hidden items-center justify-center p-8 text-center">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 rounded-full opacity-20 blur-2xl"></div>
                <MusicIcon className="relative w-28 h-28 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-200 mb-3">Focus Music Feature Disabled</h1>
             <div className="p-4 max-w-xl mx-auto bg-yellow-900/30 backdrop-blur-sm text-yellow-200 border border-yellow-500/30 rounded-lg text-center flex flex-col items-center gap-4">
                <ErrorIcon className="w-10 h-10 text-yellow-300" />
                <div>
                    <h3 className="font-bold text-lg mb-2">Security Precaution</h3>
                    <p className="text-sm">
                        To prepare this app for publishing, the YouTube API key has been removed from the code to prevent misuse.
                        <br /><br />
                        To re-enable this feature, a secure backend service must be created to handle API requests. This is a standard practice for production applications.
                    </p>
                </div>
            </div>
        </div>
    );
};