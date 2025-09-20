export type View = 'assistant' | 'youtube' | 'pomodoro' | 'notes' | 'music' | 'planner' | 'settings';
export type Theme = 'light' | 'dark';
export type AccentColor = 'emerald' | 'sky' | 'rose' | 'violet' | 'amber';

export type YouTubeVideo = {
  videoId: string;
  title: string;
};

export type PomodoroState = {
  isActive: boolean;
  mode: 'work' | 'shortBreak' | 'longBreak';
  timeLeft: number;
  sessions: number;
  sessionName: string;
};

export type ChatMessage = {
  role: 'user' | 'model';
  parts: string;
};

// New types for the Study Planner
export type StudyStep = {
  day: string; // "Day 1", "Day 2", etc.
  topic: string;
  description: string;
  youtubeSearch: string;
  pomodoroSessionName: string;
  assistantQuestion: string;
};

export type StudyPlan = {
  title: string;
  plan: StudyStep[];
};