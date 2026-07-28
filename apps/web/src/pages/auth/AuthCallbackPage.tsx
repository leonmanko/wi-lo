// src/pages/auth/AuthCallbackPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

/**
 * Page de callback OAuth.
 * 
 * Cette page intercepte la redirection après une connexion OAuth
 * (Google, Apple) et finalise l'authentification.
 * 
 * Actuellement non utilisée car seul Email/Password est activé.
 * Sera utile dès que Google OAuth sera configuré côté Supabase.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Supabase gère automatiquement le hash de l'URL OAuth
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (data.session) {
          await refreshSession();
          navigate('/', { replace: true });
        } else {
          throw new Error('Aucune session trouvée après redirection OAuth');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur d\'authentification';
        setError(message);
        // Rediriger vers la page de connexion après 5 secondes
        setTimeout(() => navigate('/login', { replace: true }), 5000);
      }
    }

    handleCallback();
  }, [navigate, refreshSession]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <p className="text-red-400 font-medium">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Finalisation de la connexion...</p>
      </div>
    </div>
  );
}