import * as React from 'react';
import { ChevronUpDownIcon } from './icons';

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

interface ScrollableNumberPickerProps {
    label: string;
    value: number;
    onChange: (newValue: number) => void;
    min?: number;
    max?: number;
}

export const ScrollableNumberPicker: React.FC<ScrollableNumberPickerProps> = ({
    label,
    value,
    onChange,
    min = 1,
    max = 180,
}) => {
    const numbers = React.useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => i + min), [min, max]);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const isInteractingRef = React.useRef(false);
    const interactionTimeoutRef = React.useRef<number | null>(null);

    // Effect to programmatically set the scroll position based on the `value` prop.
    // This runs on mount or when the value is changed from the parent, but is blocked
    // by the `isInteractingRef` flag when the user is actively scrolling.
    React.useEffect(() => {
        if (isInteractingRef.current) {
            return;
        }

        const element = containerRef.current;
        if (element) {
            const index = numbers.indexOf(value);
            if (index !== -1) {
                const targetScrollTop = index * ITEM_HEIGHT;
                // Only scroll if the position is meaningfully different, to avoid jitter.
                if (Math.abs(element.scrollTop - targetScrollTop) > 1) {
                    element.scrollTo({ top: targetScrollTop, behavior: 'auto' });
                }
            }
        }
    }, [value, numbers]);

    // Effect to handle user-initiated scrolling and update the parent state.
    React.useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const handleScroll = () => {
            isInteractingRef.current = true;
            if (interactionTimeoutRef.current) {
                window.clearTimeout(interactionTimeoutRef.current);
            }
        };

        const handleScrollEnd = () => {
            // By wrapping the calculation in requestAnimationFrame, we ensure that we read
            // the element positions AFTER the browser has finished painting the final
            // result of the CSS scroll-snap animation. This fixes the timing issue.
            requestAnimationFrame(() => {
                const scroller = containerRef.current;
                if (!scroller) return;

                const containerRect = scroller.getBoundingClientRect();
                const containerCenter = containerRect.top + containerRect.height / 2;

                let closestChild: HTMLElement | null = null;
                let minDistance = Infinity;

                // Find the child element whose center is closest to the container's center.
                for (const child of Array.from(scroller.children) as HTMLElement[]) {
                    const childRect = child.getBoundingClientRect();
                    const childCenter = childRect.top + childRect.height / 2;
                    const distance = Math.abs(containerCenter - childCenter);

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestChild = child;
                    }
                }
                
                if (closestChild) {
                    const newValue = parseInt(closestChild.textContent || '0', 10);
                    // Only notify the parent if the value is valid and has actually changed.
                    if (!isNaN(newValue) && newValue !== value) {
                        onChange(newValue);
                    }
                }

                // After calculation, create a grace period before re-enabling programmatic scrolling.
                interactionTimeoutRef.current = window.setTimeout(() => {
                    isInteractingRef.current = false;
                }, 100); 
            });
        };
        
        element.addEventListener('scroll', handleScroll, { passive: true });
        element.addEventListener('scrollend', handleScrollEnd);
        
        return () => {
            element.removeEventListener('scroll', handleScroll);
            element.removeEventListener('scrollend', handleScrollEnd);
            if (interactionTimeoutRef.current) {
                window.clearTimeout(interactionTimeoutRef.current);
            }
        };
    }, [onChange, numbers, value]); // `value` is needed to get the latest state in the closure.

    const topPadding = (Math.floor(VISIBLE_ITEMS / 2)) * ITEM_HEIGHT;

    return (
        <div className="flex flex-col items-center">
            <label className="text-sm mb-2 font-medium text-[var(--text-secondary)]">{label}</label>
            <div
                className="relative w-24 bg-slate-800/60 border border-white/10 rounded-lg"
                style={{ height: `${VISIBLE_ITEMS * ITEM_HEIGHT}px` }}
            >
                {/* Selection indicator box */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-9 bg-[var(--accent-500)]/10 border-y border-[var(--accent-500)]/40 z-10 pointer-events-none"></div>
                <ChevronUpDownIcon className="absolute top-1/2 -translate-y-1/2 right-1 w-5 h-5 text-[var(--text-muted)] opacity-50 z-20 pointer-events-none" />
                
                <div
                    ref={containerRef}
                    className="w-full h-full overflow-y-scroll snap-y snap-mandatory"
                    style={{ scrollbarWidth: 'none', paddingBlock: `${topPadding}px` }}
                >
                    {numbers.map((num) => (
                        <div
                            key={num}
                            className={`h-9 flex items-center justify-center text-xl snap-center transition-colors duration-200 ${
                                num === value ? 'text-[var(--accent-300)] font-bold' : 'text-[var(--text-muted)]'
                            }`}
                        >
                            {num}
                        </div>
                    ))}
                </div>
                
                 {/* Fading overlays for a polished visual effect */}
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-slate-900/40 to-transparent z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-slate-900/40 to-transparent z-20 pointer-events-none"></div>
            </div>
        </div>
    );
};