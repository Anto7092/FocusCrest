import * as React from 'react';
import { InfoIcon, BoldIcon, ItalicIcon, UnderlineIcon, PenIcon, TextIcon, EraserIcon, UndoIcon, RedoIcon } from './icons';

const NOTES_STORAGE_KEY = 'study-focus-notes';
const NOTES_DRAWING_STORAGE_KEY = 'study-focus-notes-drawing';
const OLD_PLACEHOLDER_CONTENT = 'Jot down formulas, <strong>concepts</strong>, or <em>quick reminders</em> here...';
const MAX_HISTORY_SIZE = 30; // Limit undo history to 30 states

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
        <div className="flex items-center space-x-2">
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

const DrawingToolbar: React.FC<{
    tool: 'pen' | 'eraser';
    setTool: (tool: 'pen' | 'eraser') => void;
    color: string;
    setColor: (color: string) => void;
    width: number;
    setWidth: (width: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}> = ({ tool, setTool, color, setColor, width, setWidth, onUndo, onRedo, canUndo, canRedo }) => {
    const colors = ['#334155', '#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#f3f4f6'];
    const widths = [2, 4, 8, 16];
    
    const buttonBaseClasses = "p-2 rounded-md transition-colors duration-200";
    const activeClasses = "bg-emerald-400/20 text-emerald-200";
    const inactiveClasses = "text-slate-300 hover:bg-slate-600/50";

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Tool Selection */}
            <button onClick={() => setTool('pen')} className={`${buttonBaseClasses} ${tool === 'pen' ? activeClasses : inactiveClasses}`} aria-label="Pen"><PenIcon className="w-5 h-5" /></button>
            <button onClick={() => setTool('eraser')} className={`${buttonBaseClasses} ${tool === 'eraser' ? activeClasses : inactiveClasses}`} aria-label="Eraser"><EraserIcon className="w-5 h-5" /></button>
            
            {/* History */}
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <button onClick={onUndo} disabled={!canUndo} className={`${buttonBaseClasses} ${inactiveClasses} disabled:opacity-50 disabled:cursor-not-allowed`} aria-label="Undo"><UndoIcon className="w-5 h-5" /></button>
            <button onClick={onRedo} disabled={!canRedo} className={`${buttonBaseClasses} ${inactiveClasses} disabled:opacity-50 disabled:cursor-not-allowed`} aria-label="Redo"><RedoIcon className="w-5 h-5" /></button>

            {/* Color Palette */}
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2">
                {colors.map(c => (
                    <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-emerald-400' : ''}`} style={{ backgroundColor: c }} aria-label={`Set color to ${c}`}></button>
                ))}
            </div>

            {/* Line Width */}
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2">
                {widths.map(w => (
                    <button key={w} onClick={() => setWidth(w)} className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${width === w ? 'bg-emerald-400/20' : 'hover:bg-slate-600/50'}`} aria-label={`Set line width to ${w}`}>
                        <div className="bg-slate-300 rounded-full" style={{ width: `${w}px`, height: `${w}px` }}></div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export const NotesView: React.FC = () => {
    const [notes, setNotes] = React.useState<string>(() => {
        const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
        if (savedNotes === null || savedNotes === OLD_PLACEHOLDER_CONTENT) return '';
        return savedNotes;
    });
    
    const editorRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const isDrawingRef = React.useRef(false);
    const isCanvasInitialized = React.useRef(false);
    
    const [isBold, setIsBold] = React.useState(false);
    const [isItalic, setIsItalic] = React.useState(false);
    const [isUnderline, setIsUnderline] = React.useState(false);
    
    // Drawing state
    const [mode, setMode] = React.useState<'text' | 'draw'>('text');
    const [drawingTool, setDrawingTool] = React.useState<'pen' | 'eraser'>('pen');
    const [penColor, setPenColor] = React.useState('#334155');
    const [penWidth, setPenWidth] = React.useState(4);
    
    // Drawing History State (using data URLs)
    const [drawingHistory, setDrawingHistory] = React.useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = React.useState(0);

    // Set initial content of the editor
    React.useEffect(() => {
        if (editorRef.current) editorRef.current.innerHTML = notes;
    }, []);

    // Save notes text to local storage
    React.useEffect(() => {
        localStorage.setItem(NOTES_STORAGE_KEY, notes);
    }, [notes]);
    
    const restoreCanvasState = React.useCallback((dataUrl: string) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
    
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
    }, []);
    
    const handleUndo = React.useCallback(() => {
        if (historyIndex > 1) {
            const newIndex = historyIndex - 1;
            const previousState = drawingHistory[newIndex - 1];
            restoreCanvasState(previousState);
            setHistoryIndex(newIndex);
            localStorage.setItem(NOTES_DRAWING_STORAGE_KEY, previousState);
        }
    }, [historyIndex, drawingHistory, restoreCanvasState]);

    const handleRedo = React.useCallback(() => {
        if (historyIndex < drawingHistory.length) {
            const newIndex = historyIndex + 1;
            const nextState = drawingHistory[newIndex - 1];
            restoreCanvasState(nextState);
            setHistoryIndex(newIndex);
            localStorage.setItem(NOTES_DRAWING_STORAGE_KEY, nextState);
        }
    }, [historyIndex, drawingHistory, restoreCanvasState]);

    // Handle keyboard shortcuts for undo/redo
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (mode !== 'draw') return;
            
            const isUndo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
            const isRedo = ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') || (e.metaKey && e.shiftKey && e.key.toLowerCase() === 'z');
    
            if (isUndo) {
                e.preventDefault();
                handleUndo();
            } else if (isRedo) {
                e.preventDefault();
                handleRedo();
            }
        };
    
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, handleUndo, handleRedo]);


    // Handle canvas setup and loading saved drawing
    React.useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const loadDrawingAndInitHistory = () => {
            const dataUrl = localStorage.getItem(NOTES_DRAWING_STORAGE_KEY);
            if (dataUrl) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    setDrawingHistory([dataUrl]); // Initialize history with loaded image
                    setHistoryIndex(1);
                };
                img.src = dataUrl;
            } else {
                 setDrawingHistory([canvas.toDataURL()]); // Initialize with blank state
                 setHistoryIndex(1);
            }
        };

        const resizeCanvas = () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;

            if (newWidth === 0 || newHeight === 0) return;
            
            const hasContent = canvas.width > 0 && canvas.height > 0;
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            if (tempCtx && hasContent) {
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCtx.drawImage(canvas, 0, 0);
            }

            canvas.width = newWidth;
            canvas.height = newHeight;

            if (tempCtx && hasContent) {
                ctx.drawImage(tempCanvas, 0, 0);
            }
            
            if (!isCanvasInitialized.current) {
                loadDrawingAndInitHistory();
                isCanvasInitialized.current = true;
            }
        };
        
        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(container);

        resizeCanvas();

        return () => resizeObserver.disconnect();

    }, []);

    // Handle drawing events
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || mode !== 'draw') return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const getCoords = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        let lastPos: { x: number, y: number } | null = null;
        
        const startDrawing = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            isDrawingRef.current = true;
            lastPos = getCoords(e);
        };
        
        const draw = (e: MouseEvent | TouchEvent) => {
            if (!isDrawingRef.current || !lastPos) return;
            e.preventDefault();
            
            const currentPos = getCoords(e);
            
            ctx.beginPath();
            ctx.globalCompositeOperation = drawingTool === 'eraser' ? 'destination-out' : 'source-over';
            ctx.strokeStyle = penColor;
            ctx.lineWidth = penWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(currentPos.x, currentPos.y);
            ctx.stroke();
            
            lastPos = currentPos;
        };
        
        const stopDrawing = () => {
            if (isDrawingRef.current) {
                isDrawingRef.current = false;
                lastPos = null;
                const currentStateUrl = canvas.toDataURL();
                
                // Truncate history if we've undone actions
                const newHistory = drawingHistory.slice(0, historyIndex);
                newHistory.push(currentStateUrl);
                
                // Trim history if it exceeds the max size
                if (newHistory.length > MAX_HISTORY_SIZE) {
                    newHistory.shift();
                }
                
                setDrawingHistory(newHistory);
                setHistoryIndex(newHistory.length);

                localStorage.setItem(NOTES_DRAWING_STORAGE_KEY, currentStateUrl);
            }
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);
        
        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };

    }, [mode, drawingTool, penColor, penWidth, drawingHistory, historyIndex]);


    // Listen for external updates (e.g., from AI Assistant save)
    React.useEffect(() => {
        const handleNotesUpdate = () => {
            const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY) || '';
            setNotes(savedNotes);
            if (editorRef.current) {
                editorRef.current.innerHTML = savedNotes;
            }
        };
        window.addEventListener('notes-updated', handleNotesUpdate);
        return () => window.removeEventListener('notes-updated', handleNotesUpdate);
    }, []);

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        setNotes(e.currentTarget.innerHTML);
    };
    
    const updateToolbarState = React.useCallback(() => {
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
            <h1 className="text-3xl font-bold text-slate-200 mb-2">Scratch <span className="text-emerald-300">Pad</span></h1>
            <div className="flex items-center gap-2 text-slate-300 mb-6 text-sm">
                <InfoIcon className="w-4 h-4" />
                <p>Your notes and drawings are automatically saved to your browser.</p>
            </div>
            <div className="flex-grow flex flex-col w-full rounded-lg shadow-inner bg-slate-900/30 ring-1 ring-white/10">
                <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded-t-lg border-b border-white/10 flex-wrap">
                    <button onClick={() => setMode('text')} className={`p-2 rounded-md transition-colors duration-200 ${mode === 'text' ? 'bg-emerald-400/20 text-emerald-200' : 'text-slate-300 hover:bg-slate-600/50'}`}><TextIcon className="w-5 h-5"/></button>
                    <button onClick={() => setMode('draw')} className={`p-2 rounded-md transition-colors duration-200 ${mode === 'draw' ? 'bg-emerald-400/20 text-emerald-200' : 'text-slate-300 hover:bg-slate-600/50'}`}><PenIcon className="w-5 h-5"/></button>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    {mode === 'text' ? (
                        <RichTextToolbar 
                            isBold={isBold}
                            isItalic={isItalic}
                            isUnderline={isUnderline}
                            onCommand={handleCommand}
                        />
                    ) : (
                        <DrawingToolbar
                            tool={drawingTool}
                            setTool={setDrawingTool}
                            color={penColor}
                            setColor={setPenColor}
                            width={penWidth}
                            setWidth={setPenWidth}
                            onUndo={handleUndo}
                            onRedo={handleRedo}
                            canUndo={historyIndex > 1}
                            canRedo={historyIndex < drawingHistory.length}
                        />
                    )}
                </div>
                <div ref={containerRef} className="relative flex-grow w-full paper-background rounded-b-md">
                    <div
                        ref={editorRef}
                        contentEditable={mode === 'text'}
                        onInput={handleContentChange}
                        onMouseUp={updateToolbarState}
                        onKeyUp={updateToolbarState}
                        onFocus={updateToolbarState}
                        className={`absolute inset-0 px-6 pt-3 pb-6 text-slate-800 resize-none focus:outline-none font-mono text-lg tracking-wide editor-placeholder ${mode === 'draw' ? 'pointer-events-none' : ''}`}
                        spellCheck="false"
                        data-placeholder="Jot down formulas, concepts, or quick reminders here..."
                    />
                    <canvas
                        ref={canvasRef}
                        className={`absolute top-0 left-0 w-full h-full ${mode === 'text' ? 'pointer-events-none' : 'touch-none'}`}
                    />
                </div>
            </div>
        </div>
    );
};