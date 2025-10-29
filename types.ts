
export interface PerformanceMetrics {
  stress: number; // 1-5
  tiredness: number; // 1-5
  happiness: number; // 1-5
  productivity: number; // 1-5
}

export interface StudySession extends PerformanceMetrics {
  id: string;
  date: string; // ISO string
  duration: number; // in minutes
  notes: string;
}

export interface TimerProfile {
  id: string;
  name: string;
  studyTime: number; // in seconds
  breakTime: number; // in seconds
}

export enum View {
  Timer = 'TIMER',
  Analytics = 'ANALYTICS',
  Chat = 'CHAT',
  Settings = 'SETTINGS',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface BackupData {
  sessions: StudySession[];
  profiles: TimerProfile[];
}

// FIX: The AIStudio interface is used for augmenting the global Window object.
// It should not be exported to avoid module conflicts that can lead to
// "Subsequent property declarations must have the same type" errors.
// Moved AIStudio interface into `declare global` to make it a truly global
// type and resolve module scope conflicts.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
