import * as React from 'react';
import { NotesView } from './NotesView';
import { XIcon } from './icons';

interface CompanionPanelViewProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CompanionPanelView: React.FC<CompanionPanelViewProps> = ({ isOpen, onClose }) => {
    return (
        <div className={`
            flex-shrink-0 bg-slate-900/20 border-l border-white/10 relative 
            transition-all duration-500 ease-in-out overflow-hidden
            ${isOpen ? 'w-full md:w-1/3' : 'w-0'}
        `}>
            <div className="w-full h-full flex flex-col">
                 <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors z-20 p-2 bg-slate-800/50 rounded-full"
                    aria-label="Close notes panel"
                >
                    <XIcon className="w-5 h-5" />
                </button>
                <NotesView />
            </div>
        </div>
    );
};