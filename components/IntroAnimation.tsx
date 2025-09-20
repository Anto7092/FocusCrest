import * as React from 'react';
import { AppLogo } from './icons';

interface IntroAnimationProps {
    onComplete: () => void;
    isTransitioning: boolean;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete, isTransitioning }) => {
    
    React.useEffect(() => {
        // Instead of a fragile, hard-coded timer, we now listen for the 'animationend'
        // event on the last element of the sequence (the logo text). This ensures a
        // perfect, synchronized handoff to the main application every time.
        const logoTextElement = document.querySelector('#logo-text');

        const handleAnimationEnd = () => {
            onComplete();
        };

        if (logoTextElement) {
            logoTextElement.addEventListener('animationend', handleAnimationEnd, { once: true });
        } else {
            // As a failsafe in the unlikely event the element isn't found,
            // trigger the completion after the known total animation duration.
            const fallbackTimer = setTimeout(onComplete, 3500);
            return () => clearTimeout(fallbackTimer);
        }
        
        // Cleanup function to remove the listener if the component unmounts.
        return () => {
            logoTextElement?.removeEventListener('animationend', handleAnimationEnd);
        };
    }, [onComplete]);

    return (
        <div className={`
            fixed inset-0 z-50 h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] texture-overlay
            ${isTransitioning ? 'animate-fadeOut' : ''}
        `}>
            <div id="intro-logo" className="w-11/12 md:w-1/2 max-w-2xl p-4">
                <AppLogo className="w-full h-auto" />
            </div>
        </div>
    );
};