import { AuthState, UserAccount, UserTier } from '../types/auth';
import { BRAND } from '../config/brand';

const AUTH_KEY = BRAND.authKey;

export const DEFAULT_GUEST_STATE: AuthState = {
  isLoggedIn: false,
  user: null,
};

export function loadStoredAuth(): AuthState {
  if (typeof window === 'undefined') return DEFAULT_GUEST_STATE;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return DEFAULT_GUEST_STATE;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        isLoggedIn: Boolean(parsed.isLoggedIn),
        user: parsed.user || null,
      };
    }
    return DEFAULT_GUEST_STATE;
  } catch (err) {
    console.error('Failed to load auth state:', err);
    return DEFAULT_GUEST_STATE;
  }
}

export function saveStoredAuth(auth: AuthState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch (err) {
    console.error('Failed to save auth state:', err);
  }
}

export function createMockAccount(name: string, email: string, tier: UserTier = 'free'): UserAccount {
  return {
    id: 'usr_' + Date.now().toString(36),
    name: name.trim() || 'Neural Explorer',
    email: email.trim().toLowerCase() || 'explorer@lumora.ai',
    tier,
    createdAt: Date.now(),
    avatarSeed: Math.random().toString(36).substring(2, 8),
  };
}
