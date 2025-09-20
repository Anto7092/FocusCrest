import * as React from 'react';
import { AppLogo } from './icons';

interface IntroAnimationProps {
    onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
    const [isFadingOut, setIsFadingOut] = React.useState(false);

    React.useEffect(() => {
        // Timer to start the fade-out, giving the logo animation time to play.
        const animationTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, 3000);

        // Timer to call the onComplete callback after the fade-out finishes.
        const completionTimer = setTimeout(() => {
            onComplete();
        }, 3800); // 3000ms for animation + 800ms for fade-out

        return () => {
            clearTimeout(animationTimer);
            clearTimeout(completionTimer);
        };
    }, [onComplete]);

    return (
        <div className={`
            flex items-center justify-center h-screen w-screen bg-slate-950/20 texture-overlay
            transition-opacity duration-800 ease-in-out
            ${isFadingOut ? 'opacity-0' : 'opacity-100'}
        `}>
            <div id="intro-logo" className="w-64 h-64">
                <AppLogo />
            </div>
        </div>
    );
};
