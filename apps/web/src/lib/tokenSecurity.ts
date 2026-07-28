// apps/web/src/lib/tokenSecurity.ts

/**
 * Module de sécurité des tokens JWT pour WI-LO.
 * 
 * POLITIQUE DE STOCKAGE DES TOKENS (non négociable) :
 * 
 * 1. Les tokens JWT (access_token, refresh_token) sont gérés EXCLUSIVEMENT
 *    par le client Supabase, qui utilise sessionStorage par défaut.
 * 
 * 2. SessionStorage > LocalStorage pour les tokens :
 *    - sessionStorage est vidé à la fermeture de l'onglet
 *    - localStorage persiste indéfiniment, plus exposé aux attaques XSS
 *    - Un token volé via XSS dans localStorage reste valide jusqu'à expiration
 *    - Un token dans sessionStorage disparaît avec l'onglet compromis
 * 
 * 3. Aucun token n'est jamais :
 *    - Stocké dans localStorage
 *    - Passé dans une URL (query string, hash)
 *    - Loggé dans la console (même en développement)
 *    - Exposé dans le state Redux/Zustand persisté
 *    - Accessible via document.cookie (pas de cookie JavaScript)
 * 
 * 4. Le store Zustand (authStore) ne stocke QUE des données non sensibles :
 *    - status, user (profil public)
 *    - JAMAIS de token, refresh_token, ou clé de session
 * 
 * 5. Supabase gère le refresh automatique des tokens :
 *    - autoRefreshToken: true dans la config du client
 *    - Les tokens expirés sont rafraîchis silencieusement
 *    - L'application ne manipule jamais les tokens bruts
 */

/**
 * Vérifie que le stockage configuré est bien sessionStorage.
 * À appeler au démarrage de l'application pour détecter toute
 * dérive de configuration.
 */
export function verifyTokenStorage(): { valid: boolean; storageType: string } {
  // Vérifier que localStorage ne contient pas de token Supabase
  const supabaseLocalKey = Object.keys(localStorage).find(
    (key) => key.startsWith('supabase.auth.token') || key.startsWith('sb-')
  );

  if (supabaseLocalKey) {
    console.warn(
      '[SECURITY] Token Supabase détecté dans localStorage. Migration vers sessionStorage...'
    );
    // Nettoyer localStorage
    localStorage.removeItem(supabaseLocalKey);
    return { valid: false, storageType: 'localStorage (nettoyé)' };
  }

  // Vérifier que sessionStorage est utilisé
  const supabaseSessionKey = Object.keys(sessionStorage).find(
    (key) => key.startsWith('supabase.auth.token') || key.startsWith('sb-')
  );

  return {
    valid: true,
    storageType: supabaseSessionKey ? 'sessionStorage' : 'aucun token stocké',
  };
}

/**
 * Nettoie toute trace de token dans localStorage (nettoyage de sécurité).
 * À appeler au démarrage et à la déconnexion.
 */
export function sanitizeTokenStorage(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.includes('supabase') ||
        key.includes('token') ||
        key.includes('auth') ||
        key.startsWith('sb-'))
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silencieux : le nettoyage est best-effort
    }
  });

  if (keysToRemove.length > 0 && import.meta.env.DEV) {
    console.warn(
      `[SECURITY] ${keysToRemove.length} entrée(s) sensible(s) nettoyée(s) du localStorage`
    );
  }
}

/**
 * Vérifie qu'aucun token n'est exposé dans l'URL courante.
 * Utile après une redirection OAuth où des tokens pourraient
 * se trouver dans le hash ou les query params.
 */
export function checkUrlForTokenLeak(): boolean {
  const url = window.location.href;

  // Vérifier les patterns de tokens dans l'URL
  const tokenPatterns = [
    /access_token=/i,
    /refresh_token=/i,
    /id_token=/i,
    /token_type=/i,
  ];

  const hasLeak = tokenPatterns.some((pattern) => pattern.test(url));

  if (hasLeak) {
    console.error(
      '[SECURITY CRITIQUE] Token détecté dans l\'URL. Nettoyage immédiat de l\'historique...'
    );
    // Nettoyer l'URL sans recharger la page
    window.history.replaceState({}, document.title, window.location.pathname);
    return false;
  }

  return true;
}

/**
 * Hook de débogage — à utiliser UNIQUEMENT en développement.
 * Vérifie l'état de la sécurité des tokens et log les informations.
 * Désactivé en production.
 */
export function debugTokenSecurity(): void {
  if (!import.meta.env.DEV) return;

  const { valid, storageType } = verifyTokenStorage();
  const urlClean = checkUrlForTokenLeak();

  console.group('[DEV] WI-LO Token Security Check');
  console.log('Stockage tokens:', storageType);
  console.log('Stockage valide:', valid ? '✅' : '❌');
  console.log('URL propre (pas de token):', urlClean ? '✅' : '❌');
  console.log('localStorage entries:', localStorage.length);
  console.log('sessionStorage entries:', sessionStorage.length);
  console.groupEnd();
}

/**
 * Liste des clés qui ne doivent JAMAIS être persistées dans un store.
 * Utilisé par authStore pour le partialize.
 */
export const SENSITIVE_KEYS = [
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'token',
  'jwt',
  'session',
  'apiKey',
  'api_key',
  'secret',
  'password',
] as const;

/**
 * Filtre un objet pour en retirer les clés sensibles avant persistance.
 * Utilitaire réutilisable par tous les stores.
 */
export function stripSensitiveData<T extends Record<string, unknown>>(
  data: T,
  additionalKeys: string[] = []
): Partial<T> {
  const keysToStrip = new Set([...SENSITIVE_KEYS, ...additionalKeys]);

  const safe: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    const isSensitive = keysToStrip.has(key) ||
      key.toLowerCase().includes('token') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('password');

    if (!isSensitive) {
      safe[key] = data[key];
    }
  }

  return safe as Partial<T>;
}