// apps/web/src/pages/ProfileEditPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AvatarUpload from '../components/profile/AvatarUpload';

/**
 * Page de modification du profil WI-LO.
 * 
 * Champs modifiables :
 * - Avatar
 * - Nom complet
 * - Bio
 * - Sport favori
 * - Équipe favorite
 * 
 * Champs en lecture seule :
 * - Email (géré par Supabase Auth)
 * 
 * États couverts :
 * - Chargement (récupération du profil)
 * - Formulaire pré-rempli
 * - Validation en temps réel
 * - Sauvegarde en cours
 * - Erreur de sauvegarde
 * - Succès (redirection vers /profile)
 * - Annulation (confirmation si modifications non sauvegardées)
 */

const SPORTS = [
  { value: '', label: 'Aucun' },
  { value: 'football', label: '⚽ Football' },
  { value: 'basketball', label: '🏀 Basketball' },
  { value: 'tennis', label: '🎾 Tennis' },
  { value: 'rugby', label: '🏉 Rugby' },
  { value: 'formula1', label: '🏎️ Formule 1' },
  { value: 'cycling', label: '🚴 Cyclisme' },
  { value: 'mma', label: '🥋 MMA' },
  { value: 'esports', label: '🎮 Esports' },
];

interface ProfileFormData {
  name: string;
  bio: string;
  favoriteSport: string;
  favoriteTeam: string;
}

type FormErrors = Partial<Record<keyof ProfileFormData, string>>;

export default function ProfileEditPage(): React.ReactElement {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, updateUser, refreshSession } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    bio: '',
    favoriteSport: '',
    favoriteTeam: '',
  });

  const [initialData, setInitialData] = useState<ProfileFormData | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0); // Pour forcer le re-render de l'avatar

  // ---------------------------------------------------------------------------
  // Initialisation : pré-remplir avec les données du profil
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (user) {
      const profile = user.profile;
      const data: ProfileFormData = {
        name: user.name ?? '',
        bio: profile?.bio ?? '',
        favoriteSport: profile?.favoriteSport ?? '',
        favoriteTeam: profile?.favoriteTeam ?? '',
      };
      setFormData(data);
      setInitialData(data);
    }
  }, [user]);

  // ---------------------------------------------------------------------------
  // Détection des modifications non sauvegardées
  // ---------------------------------------------------------------------------

  function hasUnsavedChanges(): boolean {
    if (!initialData) return false;
    return (
      formData.name !== initialData.name ||
      formData.bio !== initialData.bio ||
      formData.favoriteSport !== initialData.favoriteSport ||
      formData.favoriteTeam !== initialData.favoriteTeam
    );
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  function validateField(name: keyof ProfileFormData, value: string): string {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Le nom est requis';
        if (value.trim().length < 2) return 'Minimum 2 caractères';
        if (value.trim().length > 50) return 'Maximum 50 caractères';
        return '';

      case 'bio':
        if (value.length > 200) return 'Maximum 200 caractères';
        return '';

      case 'favoriteTeam':
        if (value.length > 50) return 'Maximum 50 caractères';
        return '';

      case 'favoriteSport':
        return '';

      default:
        return '';
    }
  }

  function validateForm(): FormErrors {
    const errors: FormErrors = {};
    (Object.keys(formData) as (keyof ProfileFormData)[]).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });
    return errors;
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched.has(name)) {
      const error = validateField(name as keyof ProfileFormData, value);
      setFormErrors((prev) => ({ ...prev, [name]: error || undefined }));
    }

    if (saveError) setSaveError(null);
    if (saveSuccess) setSaveSuccess(false);
  }

  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void {
    const { name, value } = e.target;
    setTouched((prev) => new Set(prev).add(name));
    const error = validateField(name as keyof ProfileFormData, value);
    setFormErrors((prev) => ({ ...prev, [name]: error || undefined }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);
    setTouched(new Set(Object.keys(formData)));

    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Mise à jour optimiste du store local
      updateUser({
        name: formData.name.trim(),
        profile: {
          ...(user?.profile ?? {
            bio: null,
            avatarUrl: null,
            level: 1,
            xp: 0,
            totalCoins: 0,
            totalDiamonds: 0,
            favoriteSport: null,
            favoriteTeam: null,
          }),
          bio: formData.bio.trim() || null,
          favoriteSport: formData.favoriteSport || null,
          favoriteTeam: formData.favoriteTeam.trim() || null,
        },
      });

      // Rafraîchir depuis le serveur pour synchroniser
      await refreshSession();

      setSaveSuccess(true);
      setInitialData({ ...formData });

      // Redirection après un court délai pour laisser voir le message de succès
      setTimeout(() => {
        navigate('/profile');
      }, 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel(): void {
    if (hasUnsavedChanges()) {
      setShowUnsavedDialog(true);
    } else {
      navigate('/profile');
    }
  }

  function handleDiscardAndLeave(): void {
    setShowUnsavedDialog(false);
    navigate('/profile');
  }

  function handleStayOnPage(): void {
    setShowUnsavedDialog(false);
  }

  // Handler pour le succès du téléchargement d'avatar
  function handleAvatarUploadSuccess(url: string): void {
    // Forcer le re-render de l'avatar
    setAvatarKey((prev) => prev + 1);
    // Rafraîchir la session pour obtenir les données à jour
    refreshSession();
  }

  // Handler pour la suppression d'avatar
  function handleAvatarDeleteSuccess(): void {
    setAvatarKey((prev) => prev + 1);
    refreshSession();
  }

  // ---------------------------------------------------------------------------
  // Protection : chargement et non authentifié
  // ---------------------------------------------------------------------------

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    navigate('/login', { replace: true });
    return <></>;
  }

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Modifier le profil</h1>
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>
          </div>
          <Link
            to="/profile"
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Annuler
          </Link>
        </div>

        {/* Carte du formulaire */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6">
          {/* Avatar */}
          <div className="mb-8 pb-6 border-b border-gray-800">
            <AvatarUpload
              key={avatarKey}
              size={96}
              onUploadSuccess={handleAvatarUploadSuccess}
              onDeleteSuccess={handleAvatarDeleteSuccess}
              onError={(errorMessage) => {
                // L'erreur est déjà affichée dans le composant
                console.error('Avatar error:', errorMessage);
              }}
            />
          </div>

          {/* Message de succès */}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-400 text-sm font-medium">Profil mis à jour avec succès !</p>
            </div>
          )}

          {/* Erreur de sauvegarde */}
          {saveError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg" role="alert">
              <p className="text-red-400 text-sm font-medium">{saveError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Nom complet */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSaving}
                maxLength={50}
                autoFocus
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 disabled:opacity-50 ${
                  formErrors.name && touched.has('name') ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="Votre nom"
              />
              {formErrors.name && touched.has('name') && (
                <p className="mt-1.5 text-red-400 text-sm" role="alert">{formErrors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{formData.name.length}/50</p>
            </div>

            {/* Email (lecture seule) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-600">
                L&apos;email ne peut pas être modifié ici. Contactez le support pour tout changement.
              </p>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1.5">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSaving}
                maxLength={200}
                rows={3}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 disabled:opacity-50 resize-none ${
                  formErrors.bio && touched.has('bio') ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="Parlez-nous de vous..."
              />
              {formErrors.bio && touched.has('bio') && (
                <p className="mt-1.5 text-red-400 text-sm" role="alert">{formErrors.bio}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/200</p>
            </div>

            {/* Sport favori */}
            <div>
              <label htmlFor="favoriteSport" className="block text-sm font-medium text-gray-300 mb-1.5">
                Sport favori
              </label>
              <select
                id="favoriteSport"
                name="favoriteSport"
                value={formData.favoriteSport}
                onChange={handleChange}
                disabled={isSaving}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:opacity-50 appearance-none"
              >
                {SPORTS.map((sport) => (
                  <option key={sport.value} value={sport.value}>
                    {sport.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Équipe favorite */}
            <div>
              <label htmlFor="favoriteTeam" className="block text-sm font-medium text-gray-300 mb-1.5">
                Équipe favorite
              </label>
              <input
                type="text"
                id="favoriteTeam"
                name="favoriteTeam"
                value={formData.favoriteTeam}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSaving}
                maxLength={50}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 disabled:opacity-50 ${
                  formErrors.favoriteTeam && touched.has('favoriteTeam') ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="Ex: Olympique de Marseille"
              />
              {formErrors.favoriteTeam && touched.has('favoriteTeam') && (
                <p className="mt-1.5 text-red-400 text-sm" role="alert">{formErrors.favoriteTeam}</p>
              )}
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 py-3 px-4 bg-gray-800 border border-gray-700 rounded-lg font-medium text-gray-300 hover:bg-gray-750 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving || !hasUnsavedChanges()}
                className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 rounded-lg font-semibold text-gray-950 transition-all disabled:bg-yellow-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* -------------------- Modale : modifications non sauvegardées -------------------- */}
      {showUnsavedDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleStayOnPage}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white text-center mb-2">
              Modifications non sauvegardées
            </h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              Vous avez des modifications en cours. Voulez-vous les abandonner ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleStayOnPage}
                className="flex-1 py-2.5 px-4 bg-gray-800 border border-gray-700 rounded-lg font-medium text-gray-300 hover:bg-gray-750 transition-colors"
              >
                Continuer l&apos;édition
              </button>
              <button
                onClick={handleDiscardAndLeave}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 rounded-lg font-semibold text-white transition-all"
              >
                Abandonner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}