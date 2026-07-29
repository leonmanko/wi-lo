// apps/web/src/components/profile/AvatarUpload.tsx

import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

/**
 * Composant d'upload d'avatar avec preview.
 * 
 * Fonctionnalités :
 * - Affichage de l'avatar existant ou des initiales
 * - Upload par clic (sélecteur de fichier)
 * - Upload par drag & drop
 * - Preview immédiate avant upload
 * - Barre de progression pendant l'upload
 * - Recadrage basique (centré, cover)
 * - Suppression de l'avatar existant
 * - Validation du type (JPEG, PNG, WebP) et de la taille (max 5 Mo)
 * 
 * États couverts :
 * - Vide (pas d'avatar → initiales)
 * - Avatar existant (image)
 * - Preview (fichier sélectionné, pas encore uploadé)
 * - Upload en cours (barre de progression)
 * - Erreur (fichier invalide, upload échoué)
 * - Succès (avatar mis à jour)
 */

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const BUCKET_NAME = 'avatars';

interface AvatarUploadProps {
  /** Taille de l'avatar en pixels (défaut: 96) */
  size?: number;
  /** Classes CSS additionnelles */
  className?: string;
  /** Callback après upload réussi */
  onUploadSuccess?: (url: string) => void;
  /** Callback après suppression */
  onDeleteSuccess?: () => void;
  /** Callback après erreur */
  onError?: (error: string) => void;
}

export default function AvatarUpload({
  size = 96,
  className = '',
  onUploadSuccess,
  onDeleteSuccess,
  onError,
}: AvatarUploadProps): React.ReactElement {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const avatarUrl = user?.profile?.avatarUrl ?? null;
  const displayUrl = previewUrl ?? avatarUrl;
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  // ---------------------------------------------------------------------------
  // Validation du fichier
  // ---------------------------------------------------------------------------

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Format non supporté. Utilisez JPEG, PNG ou WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Fichier trop volumineux. Maximum ${MAX_FILE_SIZE / 1024 / 1024} Mo.`;
    }
    if (file.size === 0) {
      return 'Fichier vide.';
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Gestion du fichier sélectionné
  // ---------------------------------------------------------------------------

  function handleFile(file: File): void {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    // Créer une preview locale
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Uploader automatiquement
    uploadFile(file, objectUrl);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset pour permettre de sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // ---------------------------------------------------------------------------
  // Upload vers Supabase Storage
  // ---------------------------------------------------------------------------

  async function uploadFile(file: File, objectUrl: string): Promise<void> {
    if (!user) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop() ?? 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Mettre à jour le profil localement
      updateUser({
        profile: {
          ...(user.profile ?? {
            bio: null,
            avatarUrl: null,
            level: 1,
            xp: 0,
            totalCoins: 0,
            totalDiamonds: 0,
            favoriteSport: null,
            favoriteTeam: null,
          }),
          avatarUrl: publicUrl,
        },
      });

      setUploadProgress(100);
      onUploadSuccess?.(publicUrl);

      // Nettoyer l'URL de preview après un court délai
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(null);
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'upload";
      setError(message);
      onError?.(message);
      // Nettoyer la preview en cas d'erreur
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Suppression de l'avatar
  // ---------------------------------------------------------------------------

  async function handleDelete(): Promise<void> {
    if (!user || !avatarUrl) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Extraire le chemin du fichier depuis l'URL
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      if (fileName) {
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([fileName]);

        if (deleteError) {
          throw deleteError;
        }
      }

      // Mettre à jour le profil localement
      updateUser({
        profile: {
          ...(user.profile ?? {
            bio: null,
            avatarUrl: null,
            level: 1,
            xp: 0,
            totalCoins: 0,
            totalDiamonds: 0,
            favoriteSport: null,
            favoriteTeam: null,
          }),
          avatarUrl: null,
        },
      });

      onDeleteSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(message);
      onError?.(message);
    } finally {
      setIsDeleting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Drag & drop
  // ---------------------------------------------------------------------------

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Avatar */}
      <div
        className="relative"
        style={{ width: size, height: size }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Image ou initiales */}
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={`Avatar de ${user?.name ?? 'utilisateur'}`}
            className={`w-full h-full rounded-full object-cover border-4 transition-all duration-200 ${
              isDragging
                ? 'border-yellow-400 scale-105'
                : isUploading || isDeleting
                  ? 'border-gray-600 opacity-50'
                  : 'border-gray-700 hover:border-yellow-400/50'
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className={`w-full h-full rounded-full flex items-center justify-center border-4 transition-all duration-200 bg-gray-700 ${
              isDragging
                ? 'border-yellow-400 scale-105'
                : 'border-gray-700 hover:border-yellow-400/50'
            }`}
          >
            <span
              className="font-bold text-gray-300 select-none"
              style={{ fontSize: size * 0.35 }}
            >
              {initials}
            </span>
          </div>
        )}

        {/* Overlay au survol */}
        <label
          className={`absolute inset-0 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
            isUploading || isDeleting
              ? 'pointer-events-none'
              : 'opacity-0 hover:opacity-100 bg-black/50'
          }`}
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Choisir une photo de profil"
        />
      </div>

      {/* Barre de progression */}
      {isUploading && (
        <div className="w-full max-w-[200px]">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: `${Math.max(uploadProgress, 10)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">Upload en cours...</p>
        </div>
      )}

      {/* Suppression en cours */}
      {isDeleting && (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-gray-500 border-t-gray-300 rounded-full animate-spin" />
          <p className="text-xs text-gray-500">Suppression...</p>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="text-center" role="alert">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Boutons d'action */}
      {!isUploading && !isDeleting && (
        <div className="flex items-center gap-2">
          <label className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-750 transition-colors cursor-pointer">
            {avatarUrl ? 'Changer' : 'Ajouter une photo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {avatarUrl && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 hover:border-red-500/30 transition-colors"
            >
              Supprimer
            </button>
          )}
        </div>
      )}

      {/* Indication drag & drop */}
      <p className="text-xs text-gray-600">
        JPEG, PNG ou WebP. Max 5 Mo.
      </p>
    </div>
  );
}