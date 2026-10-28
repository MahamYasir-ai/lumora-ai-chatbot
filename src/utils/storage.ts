import { Conversation, UserSettings } from '../types/chat';
import { BRAND } from '../config/brand';

const CONVERSATIONS_KEY = BRAND.storageKey;
const SETTINGS_KEY = BRAND.settingsKey;

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  model: BRAND.defaultModel,
  systemInstruction: BRAND.defaultSystemInstruction,
  temperature: 0.7,
  sidebarOpenDesktop: true,
};

export function loadStoredConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
    return [];
  } catch (err) {
    console.error('Failed to load conversations from localStorage:', err);
    return [];
  }
}

export function saveStoredConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error('Failed to save conversations to localStorage:', err);
  }
}

export function loadStoredSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Failed to load settings from localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}

export function clearAllStoredConversations(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CONVERSATIONS_KEY);
  } catch (err) {
    console.error('Failed to clear conversations:', err);
  }
}

export function generateTitleFromMessage(message: string): string {
  const cleaned = message.trim().replace(/^#+\s*/, '').replace(/\n+/g, ' ');
  if (!cleaned) return 'New Conversation';
  if (cleaned.length <= 36) return cleaned;
  return cleaned.substring(0, 36).trim() + '...';
}

export interface GroupedConversations {
  today: Conversation[];
  yesterday: Conversation[];
  earlier: Conversation[];
}

export function groupConversationsByDate(conversations: Conversation[]): GroupedConversations {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  const grouped: GroupedConversations = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  for (const conv of conversations) {
    const timestamp = conv.updatedAt || conv.createdAt;
    if (timestamp >= startOfToday) {
      grouped.today.push(conv);
    } else if (timestamp >= startOfYesterday) {
      grouped.yesterday.push(conv);
    } else {
      grouped.earlier.push(conv);
    }
  }

  return grouped;
}
