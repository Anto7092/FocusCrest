import * as React from 'react';
import { generateStudyPlan } from '../services/geminiService';
import type { StudyPlan, StudyStep } from '../types';
import { PlannerIcon, YouTubeIcon, TimerIcon, AssistantIcon, ErrorIcon } from './icons';

interface PlannerViewProps {
    onYouTubeSearch: (query: string) => void;
    onPomodoroStart: (sessionName: string) => void;
    onAssistantAsk: (query: string) => void;
}

const WelcomeScreen: React.FC = () => (
    <div className="text-center">
        <div className="relative w-40 h-40 flex items-center justify-center mb-6 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] rounded-full opacity-20 blur-2xl"></div>
            <PlannerIcon className="relative w-28 h-28 text-[var(--accent-400)]" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">AI Study Planner</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Tell the AI what you want to learn and your deadline. It will create a personalized, step-by-step study plan for you.
        </p>
    </div>
);

const StudyStepCard: React.FC<{ step: StudyStep; onAction: (type: 'youtube' | 'pomodoro' | 'assistant', value: string) => void }> = ({ step, onAction }) => {
    return (
        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute -top-10 -left-10 w-28 h-28 bg-[var(--accent-500)]/10 rounded-full blur-2xl"></div>
            <div className="relative">
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-slate-700 text-slate-100 font-bold border border-white/10 text-lg">
                        {step.day.match(/\d+/)?.[0] || '—'}
                    </div>
                    <div>
                        <p className="text-sm text-[var(--accent-300)] font-medium">{step.day}</p>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)]">{step.topic}</h3>
                    </div>
                </div>
                <p className="text-[var(--text-secondary)] mb-6 ml-16">{step.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-16">
                    <button onClick={() => onAction('youtube', step.youtubeSearch)} className="action-button">
                        <YouTubeIcon className="w-5 h-5" /><span>Find Videos</span>
                    </button>
                    <button onClick={() => onAction('pomodoro', step.pomodoroSessionName)} className="action-button">
                        <TimerIcon className="w-5 h-5" /><span>Start Session</span>
                    </button>
                    <button onClick={() => onAction('assistant', step.assistantQuestion)} className="action-button">
                        <AssistantIcon className="w-5 h-5" /><span>Ask AI</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const PlannerView: React.FC<PlannerViewProps> = ({ onYouTubeSearch, onPomodoroStart, onAssistantAsk }) => {
    const [topic, setTopic] = React.useState('');
    const [deadline, setDeadline] = React.useState('');
    const [plan, setPlan] = React.useState<StudyPlan | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleGeneratePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || !deadline.trim()) {
            setError("Please provide both a topic and a deadline.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setPlan(null);
        try {
            const result = await generateStudyPlan(topic, deadline);
            setPlan(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAction = (type: 'youtube' | 'pomodoro' | 'assistant', value: string) => {
        if (type === 'youtube') onYouTubeSearch(value);
        if (type === 'pomodoro') onPomodoroStart(value);
        if (type === 'assistant') onAssistantAsk(value);
    };

    return (
        <div className="flex flex-col w-full h-full bg-slate-900/20 overflow-y-auto p-6 md:p-8">
            <div className="max-w-4xl mx-auto w-full">
                <div className="mb-8">
                    {!plan && <WelcomeScreen />}
                </div>

                <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-8">
                    <div className="md:col-span-2">
                        <label htmlFor="topic" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Study Topic</label>
                        <input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="form-input"
                            placeholder="e.g., Quantum Mechanics"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="deadline" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Deadline</label>
                        <input
                            id="deadline"
                            type="text"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="form-input"
                            placeholder="e.g., In 2 weeks"
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" className="w-full md:col-span-1 h-11 px-6 py-2.5 bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] text-white font-semibold rounded-lg hover:from-[var(--accent-400)] hover:to-[var(--accent-500)] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:saturate-50 flex items-center justify-center" disabled={isLoading}>
                        {isLoading ? (
                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Generate Plan'}
                    </button>
                </form>

                {error && !isLoading && (
                    <div className="p-6 max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm text-[var(--text-primary)] border border-red-500/30 rounded-lg text-center flex flex-col items-center gap-4 animate-futuristicModalOpen">
                        <ErrorIcon className="w-10 h-10 text-red-300" />
                        <div>
                            <h3 className="font-bold text-lg mb-2">Could Not Generate Plan</h3>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
                
                {plan && (
                    <div className="animate-viewFadeIn">
                        <h2 className="text-3xl font-bold text-[var(--text-primary)] text-center mb-6">{plan.title}</h2>
                        <div className="space-y-6">
                            {plan.plan.map((step, index) => (
                                <StudyStepCard key={index} step={step} onAction={handleAction} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
            <style>{`
                .form-input {
                    width: 100%;
                    height: 44px; /* Consistent height */
                    padding: 0.5rem 1rem;
                    background-color: rgb(15 23 42 / 0.4);
                    color: var(--text-primary);
                    border: 1px solid rgb(255 255 255 / 0.1);
                    border-radius: 0.5rem;
                    transition: all 0.2s ease-in-out;
                }
                .form-input:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px var(--accent-500);
                    border-color: var(--accent-500);
                }
                .form-input::placeholder {
                    color: var(--text-muted);
                }
                .action-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background-color: rgb(15 23 42 / 0.5);
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    font-weight: 500;
                    border: 1px solid transparent;
                    border-radius: 0.5rem;
                    transition: all 0.2s ease-in-out;
                }
                .action-button:hover {
                    background-color: hsl(var(--color-accent-h) var(--color-accent-s) var(--color-accent-l-500) / 0.1);
                    color: var(--accent-300);
                    border-color: hsl(var(--color-accent-h) var(--color-accent-s) var(--color-accent-l-400) / 0.3);
                }
            `}</style>
        </div>
    );
};