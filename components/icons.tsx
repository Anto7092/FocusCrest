import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const AppLogo: React.FC<IconProps> = (props) => (
    <svg {...props} viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" aria-label="Focus Crest Logo">
        <defs>
            <linearGradient id="crest-grad-main" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="var(--accent-400)" />
                <stop offset="100%" stopColor="var(--accent-600)" />
            </linearGradient>
            <linearGradient id="crest-grad-dark" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="var(--bg-tertiary)" />
                <stop offset="100%" stopColor="var(--bg-quaternary)" />
            </linearGradient>
            <linearGradient id="text-grad" x1="0" y1="0.5" x2="1" y2="0.5">
                 <stop offset="0%" stopColor="var(--accent-300)" />
                 <stop offset="100%" stopColor="var(--accent-400)" />
            </linearGradient>
        </defs>

        <g transform="translate(110, 38)">
            <path 
                id="crest-main-shape"
                d="M 0 42 C -40 25 -50 -10 -50 -20 A 10 10 0 0 1 -40 -30 L 40 -30 A 10 10 0 0 1 50 -20 C 50 -10 40 25 0 42 Z" 
                fill="url(#crest-grad-dark)"
            />
            <path 
                id="crest-inner-shape"
                d="M 0 38 C -35 22 -42 -10 -42 -18 A 8 8 0 0 1 -34 -26 L 34 -26 A 8 8 0 0 1 42 -18 C 42 -10 35 22 0 38 Z"
                fill="url(#crest-grad-main)"
            />

            <g id="eye-group">
                <path d="M -28 0 C -10 -20 10 -20 28 0 C 10 20 -10 20 -28 0 Z" fill="var(--bg-tertiary)" />
                <circle cx="0" cy="0" r="12" fill="var(--accent-300)" />
                <circle cx="0" cy="0" r="10" fill="url(#crest-grad-main)" />
                <circle cx="0" cy="0" r="4" fill="var(--bg-tertiary)" />
            </g>
            
            <g id="light-rays-group" fill="var(--accent-300)" opacity="0.9">
                <path d="M 0 -15 L -8 -30 L 8 -30 Z" transform="rotate(-30 0 -22)" />
                <path d="M 0 -15 L -6 -30 L 6 -30 Z" transform="rotate(0 0 -22)" />
                <path d="M 0 -15 L -8 -30 L 8 -30 Z" transform="rotate(30 0 -22)" />
            </g>
        </g>
        
        <text 
            id="logo-text"
            x="50%" 
            y="90" 
            textAnchor="middle" 
            fontFamily="'Inter', sans-serif" 
            fontSize="18" 
            fontWeight="500" 
            fill="url(#text-grad)" 
            letterSpacing="2">
            FOCUS CREST
        </text>
    </svg>
);


export const AssistantIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5V3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11h.01M15 11h.01" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14h4" />
    </svg>
);

export const YouTubeIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.538 0 3.286L8.029 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653z" />
    </svg>
);

export const TimerIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const NotesIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

export const MusicIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2z"></path>
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"></path>
    </svg>
);

export const PlannerIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.5-15h15a2.25 2.25 0 012.25 2.25v15a2.25 2.25 0 01-2.25-2.25h-15a2.25 2.25 0 01-2.25-2.25v-15A2.25 2.25 0 014.5 2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75h4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 14.25h4.5" />
    </svg>
);

export const ErrorIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

export const PlayIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

export const PauseIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

export const ResetIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.939 10.061a8 8 0 10-9.878 9.878" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 4v6h-6" />
    </svg>
);

export const InfoIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);

export const BoldIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.5 15.5H10V12.5H13.5C14.33 12.5 15 13.17 15 14C15 14.83 14.33 15.5 13.5 15.5M10 6.5H13C13.83 6.5 14.5 7.17 14.5 8C14.5 8.83 13.83 9.5 13 9.5H10V6.5M15.6 10.79C16.57 10.11 17.25 9 17.25 7.75C17.25 5.74 15.5 4 13.25 4H7.5V18H14.04C16.14 18 17.75 16.3 17.75 14.21C17.75 12.69 16.89 11.39 15.6 10.79Z" />
    </svg>
);

export const ItalicIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 4V7H12.21L8.79 15H6V18H14V15H11.79L15.21 7H18V4H10Z" />
    </svg>
);

export const UnderlineIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 21H19V19H5V21M12 17C15.31 17 18 14.31 18 11V3H15.5V11C15.5 12.93 13.93 14.5 12 14.5C10.07 14.5 8.5 12.93 8.5 11V3H6V11C6 14.31 8.69 17 12 17Z" />
    </svg>
);

export const ChevronUpDownIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const XIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const MenuIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const SaveToNotesIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const PenIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
);

export const TextIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.75a.75.75 0 0 0-.75-.75H10.5a.75.75 0 0 0-.75.75v.75a.75.75 0 0 0 .75.75h3a.75.75 0 0 0 .75-.75v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75a.75.75 0 0 0-.75-.75H3a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 0 0 .75-.75v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75a.75.75 0 0 0-.75-.75H8.25a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 0 0 .75-.75v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12.75a.75.75 0 0 0-.75-.75h-.75a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 0 0 .75-.75v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 12.75a.75.75 0 0 0-.75-.75h-.75a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 0 0 .75-.75v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 17.25a.75.75 0 0 0-.75-.75H5.25a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 0 0 .75-.75v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 17.25a.75.75 0 0 0-.75-.75h-9a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
);

export const EraserIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5-7.5-7.5 7.5-7.5zM11.25 4.5L21 14.25" />
    </svg>
);

export const UndoIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);

export const RedoIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
    </svg>
);

export const UploadIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);