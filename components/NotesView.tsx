import * as React from 'react';
import { InfoIcon, BoldIcon, ItalicIcon, UnderlineIcon, PenIcon, TextIcon, EraserIcon, UndoIcon, RedoIcon } from './icons';

// New storage key and data structure for paginated notes
const NOTES_V2_STORAGE_KEY = 'study-focus-notes-v2';
type NotesData = {
    pages: string[];
    drawings: string[];
};

// Old keys for migration
const OLD_NOTES_KEY = 'study-focus-notes';
const OLD_DRAWING_KEY = 'study-focus-notes-drawing';

const MAX_HISTORY_SIZE = 30;

const RichTextToolbar: React.FC<{
    isBold: boolean; isItalic: boolean; isUnderline: boolean;
    onCommand: (command: string) => void;
}> = ({ isBold, isItalic, isUnderline, onCommand }) => {
    const buttonBase = "p-2 rounded-md transition-colors duration-200";
    const active = "bg-[var(--accent-400)]/20 text-[var(--accent-200)]";
    const inactive = "text-[var(--text-secondary)] hover:bg-slate-600/50";
    return (
        <div className="flex items-center space-x-2">
            <button onClick={() => onCommand('bold')} className={`${buttonBase} ${isBold ? active : inactive}`} aria-pressed={isBold} aria-label="Bold"><BoldIcon className="w-5 h-5" /></button>
            <button onClick={() => onCommand('italic')} className={`${buttonBase} ${isItalic ? active : inactive}`} aria-pressed={isItalic} aria-label="Italic"><ItalicIcon className="w-5 h-5" /></button>
            <button onClick={() => onCommand('underline')} className={`${buttonBase} ${isUnderline ? active : inactive}`} aria-pressed={isUnderline} aria-label="Underline"><UnderlineIcon className="w-5 h-5" /></button>
        </div>
    );
};

const DrawingToolbar: React.FC<{
    tool: 'pen' | 'eraser'; setTool: (tool: 'pen' | 'eraser') => void;
    color: string; setColor: (color: string) => void;
    width: number; setWidth: (width: number) => void;
    onUndo: () => void; onRedo: () => void;
    canUndo: boolean; canRedo: boolean;
}> = ({ tool, setTool, color, setColor, width, setWidth, onUndo, onRedo, canUndo, canRedo }) => {
    const colors = ['#334155', '#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#f3f4f6'];
    const widths = [2, 4, 8, 16];
    const buttonBase = "p-2 rounded-md transition-colors duration-200";
    const active = "bg-[var(--accent-400)]/20 text-[var(--accent-200)]";
    const inactive = "text-[var(--text-secondary)] hover:bg-slate-600/50";
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setTool('pen')} className={`${buttonBase} ${tool === 'pen' ? active : inactive}`} aria-label="Pen"><PenIcon className="w-5 h-5" /></button>
            <button onClick={() => setTool('eraser')} className={`${buttonBase} ${tool === 'eraser' ? active : inactive}`} aria-label="Eraser"><EraserIcon className="w-5 h-5" /></button>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <button onClick={onUndo} disabled={!canUndo} className={`${buttonBase} ${inactive} disabled:opacity-50`} aria-label="Undo"><UndoIcon className="w-5 h-5" /></button>
            <button onClick={onRedo} disabled={!canRedo} className={`${buttonBase} ${inactive} disabled:opacity-50`} aria-label="Redo"><RedoIcon className="w-5 h-5" /></button>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2">
                {colors.map(c => <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-[var(--accent-400)]' : ''}`} style={{ backgroundColor: c }} aria-label={`Color ${c}`}></button>)}
            </div>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2">
                {widths.map(w => <button key={w} onClick={() => setWidth(w)} className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${width === w ? 'bg-[var(--accent-400)]/20' : 'hover:bg-slate-600/50'}`} aria-label={`Width ${w}`}><div className="bg-slate-300 rounded-full" style={{ width: `${w}px`, height: `${w}px` }}></div></button>)}
            </div>
        </div>
    );
}

const PaginationControls: React.FC<{
    currentPage: number; totalPages: number;
    onPrev: () => void; onNext: () => void; onNew: () => void;
}> = ({ currentPage, totalPages, onPrev, onNext, onNew }) => (
    <div className="flex-shrink-0 flex items-center justify-center gap-4 p-2 bg-slate-800/50 rounded-b-lg border-t border-white/10 text-[var(--text-secondary)] text-sm">
        <button onClick={onPrev} disabled={currentPage === 0} className="px-3 py-1 rounded hover:bg-slate-700 disabled:opacity-50">&lt; Prev</button>
        <span className="font-mono">Page {currentPage + 1} of {totalPages}</span>
        <button onClick={onNext} disabled={currentPage === totalPages - 1} className="px-3 py-1 rounded hover:bg-slate-700 disabled:opacity-50">Next &gt;</button>
        <div className="w-px h-5 bg-white/10 mx-2"></div>
        <button onClick={onNew} className="px-3 py-1 rounded bg-[var(--accent-500)]/20 text-[var(--accent-200)] hover:bg-[var(--accent-500)]/30">New Page</button>
    </div>
);

export const NotesView: React.FC = () => {
    const [pages, setPages] = React.useState<string[]>(['']);
    const [drawingData, setDrawingData] = React.useState<string[]>([]);
    const [currentPageIndex, setCurrentPageIndex] = React.useState(0);
    
    const editorRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    
    const isDrawingRef = React.useRef(false);
    const isRepaginatingRef = React.useRef(false);
    const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });
    
    const [isBold, setIsBold] = React.useState(false);
    const [isItalic, setIsItalic] = React.useState(false);
    const [isUnderline, setIsUnderline] = React.useState(false);
    
    const [mode, setMode] = React.useState<'text' | 'draw'>('text');
    const [drawingTool, setDrawingTool] = React.useState<'pen' | 'eraser'>('pen');
    const [penColor, setPenColor] = React.useState('#334155');
    const [penWidth, setPenWidth] = React.useState(4);
    
    const [drawingHistory, setDrawingHistory] = React.useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = React.useState(0);

    const getBlankCanvasDataUrl = React.useCallback((canvas: HTMLCanvasElement | null) => {
        if (!canvas) return '';
        const blank = document.createElement('canvas');
        blank.width = canvas.width > 0 ? canvas.width : 300;
        blank.height = canvas.height > 0 ? canvas.height : 150;
        return blank.toDataURL();
    }, []);

    React.useEffect(() => {
        const savedData = localStorage.getItem(NOTES_V2_STORAGE_KEY);
        if (savedData) {
            try {
                const data: NotesData = JSON.parse(savedData);
                if (data.pages && data.pages.length > 0) {
                    setPages(data.pages);
                    setDrawingData(data.drawings || Array(data.pages.length).fill(''));
                    return;
                }
            } catch (e) { console.error("Failed to parse notes", e); }
        }

        const oldNotes = localStorage.getItem(OLD_NOTES_KEY);
        const oldDrawing = localStorage.getItem(OLD_DRAWING_KEY);
        if (oldNotes || oldDrawing) {
            const migrated: NotesData = { pages: [oldNotes || ''], drawings: [oldDrawing || ''] };
            setPages(migrated.pages);
            setDrawingData(migrated.drawings);
            localStorage.setItem(NOTES_V2_STORAGE_KEY, JSON.stringify(migrated));
            localStorage.removeItem(OLD_NOTES_KEY);
            localStorage.removeItem(OLD_DRAWING_KEY);
        } else {
             setDrawingData([getBlankCanvasDataUrl(canvasRef.current)]);
        }
    }, [getBlankCanvasDataUrl]);

    React.useEffect(() => {
        if (pages.length > 0 || drawingData.length > 0) {
            const data: NotesData = { pages, drawings: drawingData };
            localStorage.setItem(NOTES_V2_STORAGE_KEY, JSON.stringify(data));
        }
    }, [pages, drawingData]);
    
    const loadCanvasForPage = React.useCallback((index: number) => {
        const dataUrl = drawingData[index];
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (dataUrl && dataUrl.startsWith('data:image')) {
            const img = new Image();
            img.onload = () => { ctx.drawImage(img, 0, 0); setDrawingHistory([dataUrl]); setHistoryIndex(1); };
            img.src = dataUrl;
        } else {
            setDrawingHistory([canvas.toDataURL()]); setHistoryIndex(1);
        }
    }, [drawingData]);

    React.useEffect(() => {
        const editor = editorRef.current;
        if (editor && editor.innerHTML !== (pages[currentPageIndex] || '')) {
            editor.innerHTML = pages[currentPageIndex] || '';
        }
        loadCanvasForPage(currentPageIndex);
    }, [currentPageIndex, pages, loadCanvasForPage]);


    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);
    
    // Effect for automatic pagination based on a line limit.
    React.useEffect(() => {
        const editor = editorRef.current;
        // Only run for text mode, and not while another pagination is in progress.
        if (!editor || mode !== 'text' || isRepaginatingRef.current) {
            return;
        }

        const LINE_LIMIT = 15;

        // Debounce the pagination check to avoid running on every keystroke.
        const timeoutId = setTimeout(() => {
            // Browsers often wrap lines in <div>s or <p>s. Counting child elements is a good proxy for lines.
            const lines = editor.children;

            if (lines.length > LINE_LIMIT) {
                isRepaginatingRef.current = true; // Set lock to prevent loops

                const allChildren = Array.from(lines);
                const currentNodes = allChildren.slice(0, LINE_LIMIT);
                const overflowNodes = allChildren.slice(LINE_LIMIT);

                // Check if there is actual content to move.
                if (overflowNodes.length === 0 || overflowNodes.every(node => node.textContent?.trim() === '')) {
                    isRepaginatingRef.current = false; // Release lock if nothing to do
                    return;
                }

                // Create HTML from the DOM nodes.
                const tempDivCurrent = document.createElement('div');
                currentNodes.forEach(node => tempDivCurrent.appendChild(node.cloneNode(true)));
                const currentPageHtml = tempDivCurrent.innerHTML;

                const tempDivOverflow = document.createElement('div');
                overflowNodes.forEach(node => tempDivOverflow.appendChild(node.cloneNode(true)));
                const overflowHtml = tempDivOverflow.innerHTML;
                
                // Update the state for pages.
                setPages(currentPages => {
                    const newPages = [...currentPages];
                    newPages[currentPageIndex] = currentPageHtml; // Update current page content

                    const nextPageIndex = currentPageIndex + 1;
                    if (newPages[nextPageIndex] !== undefined) {
                        // Prepend overflow to the existing next page.
                        newPages[nextPageIndex] = overflowHtml + newPages[nextPageIndex];
                    } else {
                        // Or create a new page with the overflow content.
                        newPages.push(overflowHtml);
                    }
                    return newPages;
                });
                
                // Automatically navigate to the next page.
                setCurrentPageIndex(p => p + 1);
            }
        }, 250); // A 250ms debounce is reasonable.

        return () => clearTimeout(timeoutId);

    }, [pages[currentPageIndex], currentPageIndex, mode]);
    
    React.useEffect(() => {
        if (drawingData.length < pages.length) {
            const diff = pages.length - drawingData.length;
            const newDrawings = Array(diff).fill(getBlankCanvasDataUrl(canvasRef.current));
            setDrawingData(d => [...d, ...newDrawings]);
        } else if (drawingData.length > pages.length) {
            setDrawingData(d => d.slice(0, pages.length));
        }
    }, [pages, drawingData.length, getBlankCanvasDataUrl]);

    React.useEffect(() => { isRepaginatingRef.current = false; }, [pages]);
    
    React.useEffect(() => {
        const handleSaveEvent = (e: Event) => {
            const contentToAppend = (e as CustomEvent).detail;
            if (typeof contentToAppend !== 'string') return;
            
            setPages(currentPages => {
                const newPages = [...currentPages];
                const lastPageIndex = Math.max(0, newPages.length - 1);
                newPages[lastPageIndex] = (newPages[lastPageIndex] || '') + contentToAppend;
                setCurrentPageIndex(lastPageIndex); // Switch to the last page on save
                return newPages;
            });
        };
        window.addEventListener('save-to-notes', handleSaveEvent);
        return () => window.removeEventListener('save-to-notes', handleSaveEvent);
    }, []);

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        if (isRepaginatingRef.current) return;
        const newContent = e.currentTarget.innerHTML;
        setPages(currentPages => {
            const newPages = [...currentPages];
            if (newPages[currentPageIndex] !== newContent) {
                newPages[currentPageIndex] = newContent;
                return newPages;
            }
            return currentPages;
        });
    };

    const handleCommand = (command: string) => { document.execCommand(command, false); editorRef.current?.focus(); updateToolbarState(); };
    const updateToolbarState = React.useCallback(() => { setIsBold(document.queryCommandState('bold')); setIsItalic(document.queryCommandState('italic')); setIsUnderline(document.queryCommandState('underline')); }, []);
    
    const handleUndo = () => { if (historyIndex > 1) { const newIndex = historyIndex - 1; restoreCanvasState(drawingHistory[newIndex - 1]); setHistoryIndex(newIndex); } };
    const handleRedo = () => { if (historyIndex < drawingHistory.length) { const newIndex = historyIndex + 1; restoreCanvasState(drawingHistory[newIndex - 1]); setHistoryIndex(newIndex); } };
    const restoreCanvasState = (dataUrl: string) => { const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (!canvas || !ctx) return; const img = new Image(); img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); }; img.src = dataUrl; };
    
    // Optimized drawing effect for smoother lines and better performance
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || mode !== 'draw') return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const getCoords = (e: MouseEvent | TouchEvent) => {
            const r = canvas.getBoundingClientRect();
            const cX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const cY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            return { x: cX - r.left, y: cY - r.top };
        };

        const points: { x: number, y: number }[] = [];
        let animationFrameId: number | null = null;
        let lastPointIndex = 0;

        const render = () => {
            animationFrameId = null; // Allow scheduling a new frame
            if (points.length <= lastPointIndex) return;
            
            ctx.globalCompositeOperation = drawingTool === 'eraser' ? 'destination-out' : 'source-over';
            ctx.strokeStyle = penColor;
            ctx.lineWidth = penWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Process only new points to draw new line segments
            for (let i = lastPointIndex; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                // Calculate midpoint for the curve for a smoother line
                const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
                ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
            }
            ctx.stroke(); // Draw all the new segments
            
            lastPointIndex = points.length - 1;
        };

        const requestRender = () => {
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        const start = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            isDrawingRef.current = true;
            points.length = 0; // Reset for a new line
            lastPointIndex = 0;
            
            const coords = getCoords(e);
            points.push(coords);
            
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        };

        const move = (e: MouseEvent | TouchEvent) => {
            if (!isDrawingRef.current) return;
            e.preventDefault();
            points.push(getCoords(e));
            requestRender();
        };

        const stop = () => {
            if (!isDrawingRef.current) return;
            isDrawingRef.current = false;

            // A small timeout ensures the final animation frame has fired before saving
            setTimeout(() => {
                // Draw a dot if it was just a click with no movement
                if (points.length < 3 && canvas && points.length > 0) {
                     const p = points[0];
                     ctx.globalCompositeOperation = drawingTool === 'eraser' ? 'destination-out' : 'source-over';
                     ctx.fillStyle = drawingTool === 'eraser' ? 'rgba(0,0,0,1)' : penColor; // Eraser needs an opaque fill
                     ctx.beginPath();
                     ctx.arc(p.x, p.y, penWidth / 2, 0, 2 * Math.PI);
                     ctx.fill();
                }

                const url = canvas.toDataURL();
                const newHistory = drawingHistory.slice(0, historyIndex);
                newHistory.push(url);
                if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift();
                setDrawingHistory(newHistory);
                setHistoryIndex(newHistory.length);
                setDrawingData(d => {
                    const n = [...d];
                    n[currentPageIndex] = url;
                    return n;
                });
            }, 50);
        };

        canvas.addEventListener('mousedown', start);
        canvas.addEventListener('mousemove', move);
        canvas.addEventListener('mouseup', stop);
        canvas.addEventListener('mouseleave', stop);
        canvas.addEventListener('touchstart', start, { passive: false });
        canvas.addEventListener('touchmove', move, { passive: false });
        canvas.addEventListener('touchend', stop);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousedown', start);
            canvas.removeEventListener('mousemove', move);
            canvas.removeEventListener('mouseup', stop);
            canvas.removeEventListener('mouseleave', stop);
            canvas.removeEventListener('touchstart', start);
            canvas.removeEventListener('touchmove', move);
            canvas.removeEventListener('touchend', stop);
        };
    }, [mode, drawingTool, penColor, penWidth, drawingHistory, historyIndex, currentPageIndex]);


    return (
        <div className="flex flex-col w-full h-full p-6">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Scratch <span className="text-[var(--accent-300)]">Pad</span></h1>
            <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-6 text-sm">
                <InfoIcon className="w-4 h-4" />
                <p>Your notes and drawings are automatically saved to your browser.</p>
            </div>
            <div className="flex-grow flex flex-col w-full rounded-lg shadow-inner bg-slate-900/30 ring-1 ring-white/10">
                <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded-t-lg border-b border-white/10 flex-wrap">
                    <button onClick={() => setMode('text')} className={`p-2 rounded-md transition-colors ${mode === 'text' ? 'bg-[var(--accent-400)]/20 text-[var(--accent-200)]' : 'text-[var(--text-secondary)] hover:bg-slate-600/50'}`}><TextIcon className="w-5 h-5"/></button>
                    <button onClick={() => setMode('draw')} className={`p-2 rounded-md transition-colors ${mode === 'draw' ? 'bg-[var(--accent-400)]/20 text-[var(--accent-200)]' : 'text-[var(--text-secondary)] hover:bg-slate-600/50'}`}><PenIcon className="w-5 h-5"/></button>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    {mode === 'text' ? (
                        <RichTextToolbar isBold={isBold} isItalic={isItalic} isUnderline={isUnderline} onCommand={handleCommand} />
                    ) : (
                        <DrawingToolbar tool={drawingTool} setTool={setDrawingTool} color={penColor} setColor={setPenColor} width={penWidth} setWidth={setPenWidth} onUndo={handleUndo} onRedo={handleRedo} canUndo={historyIndex > 1} canRedo={historyIndex < drawingHistory.length} />
                    )}
                </div>
                <div ref={containerRef} className="relative flex-grow w-full paper-background overflow-hidden">
                     <div
                        ref={editorRef}
                        contentEditable={mode === 'text'}
                        onInput={handleContentChange}
                        onMouseUp={updateToolbarState}
                        onKeyUp={updateToolbarState}
                        onFocus={updateToolbarState}
                        className={`w-full h-full px-6 pt-3 pb-6 resize-none focus:outline-none font-mono text-lg tracking-wide editor-placeholder overflow-auto ${mode === 'draw' ? 'pointer-events-none' : ''}`}
                        spellCheck="false"
                        data-placeholder="Start typing here..."
                    />
                    <canvas
                        ref={canvasRef}
                        className={`absolute top-0 left-0 w-full h-full ${mode === 'text' ? 'pointer-events-none' : 'touch-none'}`}
                        width={containerSize.width}
                        height={containerSize.height}
                    />
                </div>
                <PaginationControls
                    currentPage={currentPageIndex}
                    totalPages={pages.length}
                    onPrev={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
                    onNext={() => setCurrentPageIndex(p => Math.min(pages.length - 1, p + 1))}
                    onNew={() => {
                        const newPageIndex = pages.length;
                        setPages(p => [...p, '']);
                        setCurrentPageIndex(newPageIndex);
                    }}
                />
            </div>
        </div>
    );
};
