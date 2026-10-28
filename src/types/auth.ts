export type UserTier = 'free' | 'pro';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
  createdAt: number;
  avatarSeed: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: UserAccount | null;
}
