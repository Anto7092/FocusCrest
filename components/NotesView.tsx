import React, { useState, useEffect, useCallback, useRef } from 'react';
import { InfoIcon, BoldIcon, ItalicIcon, UnderlineIcon } from './icons';

const NOTES_STORAGE_KEY = 'study-focus-notes';
const OLD_PLACEHOLDER_CONTENT = 'Jot down formulas, <strong>concepts</strong>, or <em>quick reminders</em> here...';

const RichTextToolbar: React.FC<{
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    onCommand: (command: string) => void;
}> = ({ isBold, isItalic, isUnderline, onCommand }) => {
    
    const buttonBaseClasses = "p-2 rounded-md transition-colors duration-200";
    const activeClasses = "bg-emerald-400/20 text-emerald-200";
    const inactiveClasses = "text-slate-300 hover:bg-slate-600/50";

    return (
        <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded-t-lg border-b border-white/10">
            <button
                onClick={() => onCommand('bold')}
                className={`${buttonBaseClasses} ${isBold ? activeClasses : inactiveClasses}`}
                aria-pressed={isBold}
                aria-label="Bold"
            >
                <BoldIcon className="w-5 h-5" />
            </button>
            <button
                onClick={() => onCommand('italic')}
                className={`${buttonBaseClasses} ${isItalic ? activeClasses : inactiveClasses}`}
                aria-pressed={isItalic}
                aria-label="Italic"
            >
                <ItalicIcon className="w-5 h-5" />
            </button>
            <button
                onClick={() => onCommand('underline')}
                className={`${buttonBaseClasses} ${isUnderline ? activeClasses : inactiveClasses}`}
                aria-pressed={isUnderline}
                aria-label="Underline"
            >
                <UnderlineIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export const NotesView: React.FC = () => {
    const [notes, setNotes] = useState<string>(() => {
        const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
        // Handle backward compatibility: if saved notes are the old placeholder, treat as empty.
        if (savedNotes === null || savedNotes === OLD_PLACEHOLDER_CONTENT) {
            return '';
        }
        return savedNotes;
    });
    const editorRef = useRef<HTMLDivElement>(null);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

    // Set initial content of the editor only once on mount
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = notes;
        }
    }, []); // Empty dependency array ensures this runs only once.

    // Save notes to local storage whenever they change
    useEffect(() => {
        localStorage.setItem(NOTES_STORAGE_KEY, notes);
    }, [notes]);

    // Update state on input without causing a re-render that moves the cursor
    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        const newContent = e.currentTarget.innerHTML;
        setNotes(newContent);
    };
    
    const updateToolbarState = useCallback(() => {
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
        setIsUnderline(document.queryCommandState('underline'));
    }, []);

    const handleCommand = (command: string) => {
        document.execCommand(command, false);
        editorRef.current?.focus();
        updateToolbarState();
    };

    return (
        <div className="flex flex-col w-full h-full bg-slate-900/20 p-6">
            <h1 className="text-3xl font-bold text-slate-200 mb-2">
                Scratch <span className="text-emerald-300">Pad</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-300 mb-6 text-sm">
                <InfoIcon className="w-4 h-4" />
                <p>
                    Your formatted notes are automatically saved to this browser's local storage.
                </p>
            </div>
            <div className="flex-grow flex flex-col w-full rounded-lg shadow-inner bg-slate-900/30 ring-1 ring-white/10">
                <RichTextToolbar 
                    isBold={isBold}
                    isItalic={isItalic}
                    isUnderline={isUnderline}
                    onCommand={handleCommand}
                />
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleContentChange}
                    onMouseUp={updateToolbarState}
                    onKeyUp={updateToolbarState}
                    onFocus={updateToolbarState}
                    className="relative flex-grow w-full px-6 pt-3 pb-6 text-slate-800 rounded-b-md resize-none focus:outline-none font-mono text-lg tracking-wide paper-background editor-placeholder"
                    spellCheck="false"
                    data-placeholder="Jot down formulas, concepts, or quick reminders here..."
                />
            </div>
        </div>
    );
};