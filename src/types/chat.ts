export type Role = 'user' | 'assistant' | 'model';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
  modelUsed?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export interface UserSettings {
  theme: ThemeMode;
  model: string;
  systemInstruction: string;
  temperature: number;
  sidebarOpenDesktop: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface AIModel {
  id: string;
  name: string;
  shortName: string;
  tier: 'free' | 'pro';
  badge: string;
  description: string;
}

