import * as React from 'react';

const StepCard: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => {
    return (
        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-100 font-bold border border-white/10">
                    {number}
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                    <div className="text-slate-300 space-y-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};


export const GuideView: React.FC = () => {
    return (
        <div className="flex flex-col w-full h-full bg-slate-900/20 overflow-y-auto p-8 md:p-12 text-slate-100">
            <div className="max-w-5xl mx-auto w-full">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2">Get Started</h1>
                    <p className="text-lg text-slate-300">To start your focused study session, follow these steps.</p>
                </header>

                <main className="grid md:grid-cols-3 gap-6">
                    <StepCard number={1} title="Configure your Tools">
                        <p>
                            Personalize your study intervals by configuring the Pomodoro timer.
                            You can set custom durations for focus sessions, short breaks, and long breaks.
                        </p>
                        <div className="bg-slate-800/50 p-3 rounded-md text-sm text-slate-300 border border-white/10">
                            <p>Go to <span className="font-semibold text-emerald-300">Pomodoro Timer</span> {"->"} Click the <span className="font-semibold text-emerald-300">Settings</span> icon.</p>
                        </div>
                    </StepCard>

                    <StepCard number={2} title="Gather your Resources">
                        <p>
                            Use the AI Assistant for research and find educational videos with EduTube.
                            Any valuable information you find can be saved directly to your personal Scratch Pad.
                        </p>
                         <div className="bg-slate-800/50 p-3 rounded-md text-sm text-slate-300 border border-white/10">
                            <p>In the AI Assistant, click <span className="font-semibold text-emerald-300">'Save to Notes'</span> under any response.</p>
                        </div>
                    </StepCard>

                    <StepCard number={3} title="Start your Session & Focus">
                        <p>
                            Once you're set up, start the timer and choose some focus music to get in the zone.
                            A global control bar will appear at the bottom for easy access while using other tools.
                        </p>
                         <div className="bg-slate-800/50 p-3 rounded-md text-sm text-slate-300 border border-white/10">
                            <p>Click <span className="font-semibold text-emerald-300">Play</span> on the timer and let the learning begin!</p>
                        </div>
                    </StepCard>
                </main>
            </div>
        </div>
    );
};