import { DurationSettings } from "./App";

export type View = 'assistant' | 'youtube' | 'pomodoro' | 'notes' | 'music' | 'planner' | 'settings';

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

export type ColorPalette = {
    accent100: string;
    accent200: string;
    accent300: string;
    accent400: string;
    accent500: string;
    accent600: string;
    
    bgSecondary: string;
    bgTertiary: string;
    bgQuaternary: string;
    
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    borderPrimary: string;
    borderSecondary: string;

    shadowAccent: string;
    
    paperColor: string;
    lineColor: string;
    paperTextColor: string;
    paperTextBold: string;
    paperPlaceholder: string;
    
    userBubbleBg: string;
    userBubbleText: string;
    
    backgroundFilter: string;
};


export type BackgroundImage = {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  palette: ColorPalette;
};

// --- New Types for Pomodoro Sounds ---
export type NotificationSound = {
  id: string;
  name: string;
  url: string; // Will be a base64 data URI
};

export type PomodoroSettings = {
  durations: DurationSettings;
  soundId: string;
};
