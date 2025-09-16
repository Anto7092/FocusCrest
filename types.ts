export type View = 'assistant' | 'youtube' | 'pomodoro' | 'notes' | 'music';

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
