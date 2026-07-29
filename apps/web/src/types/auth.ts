// apps/web/src/types/auth.ts

/**
 * Types d'authentification pour WI-LO.
 * Synchronisés avec le contrat Zod du backend (auth.router.ts).
 * 
 * Contrat auth.me :
 *   Entrée  : { userId: string } (extrait du JWT)
 *   Sortie  : UserProfile
 */

export type UserRole = 'user' | 'admin' | 'moderator';

/** Consentement RGPD (stocké séparément, pas dans UserProfile) */
export interface ConsentRecord {
  consentType: 'personalized_ads' | 'analytics' | 'cookies';
  granted: boolean;
  timestamp: string;
}

// apps/web/src/types/auth.ts — Ajouter createdAt

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  birthDate: string;
  lastSignedIn: string | null;
  createdAt: string;  // ← Ajouté
  profile: {
    bio: string | null;
    avatarUrl: string | null;
    level: number;
    xp: number;
    totalCoins: number;
    totalDiamonds: number;
    favoriteSport: string | null;
    favoriteTeam: string | null;
  } | null;
}

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export interface AuthError {
  code: string;
  message: string;
  statusCode?: number;
}

// apps/web/src/types/auth.ts — Mise à jour de l'interface AuthContext

export interface AuthContext {
  status: AuthStatus;
  user: UserProfile | null;
  error: AuthError | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  login: (provider: AuthProvider) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  enableMfa: () => Promise<string>;
  verifyMfa: (code: string) => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => void;
  hasConsent: (consentType: string) => boolean;
  clearError: () => void;  // ← Ajouté
}

export type AuthProvider = 'google' | 'apple' | 'email';

export interface RegisterParams {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  consents: {
    personalized_ads: boolean;
    analytics: boolean;
    cookies: boolean;
  };
  favoriteSport?: string;
}