export type PersonaMode = 'hybrid' | 'waddah' | 'captain_luka' | 'luka_fast';

export interface AppRoute {
  path: string;
  name: string;
  description: string;
}

export interface EzoutiApp {
  id: string;
  name: string;
  tagline: string;
  category: string;
  color: string;
  description: string;
  routes: AppRoute[];
  sampleQuestions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  persona?: PersonaMode;
  audioUrl?: string;
  isAudioLoading?: boolean;
}
