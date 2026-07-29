import 'dart:ui';

/// Placeholder Design Tokens — Couleurs (thème stade nocturne).
///
/// TODO: Sprint 4B — Remplacer par les tokens officiels synchronisés Figma.
class AppColors {
  AppColors._();

  // --- Fondations ---
  static const Color backgroundPrimary = Color(0xFF0A0E21);
  static const Color backgroundSecondary = Color(0xFF1A1F3A);
  static const Color surfaceElevated = Color(0xFF252B4A);

  // --- Texte ---
  static const Color textPrimary = Color(0xFFF0F0F5);
  static const Color textSecondary = Color(0xFF8E8E9A);
  static const Color textTertiary = Color(0xFF5C5C6A);

  // --- Accents ---
  static const Color accentPrimary = Color(0xFF00E5FF);
  static const Color accentSuccess = Color(0xFF00E676);
  static const Color accentError = Color(0xFFFF1744);
  static const Color accentWarning = Color(0xFFFF9100);

  // --- Rareté des cartes (WI-LO Legends) ---
  static const Color rarityBronze = Color(0xFFCD7F32);
  static const Color raritySilver = Color(0xFFC0C0C0);
  static const Color rarityGold = Color(0xFFFFD700);
  static const Color rarityIcon = Color(0xFF9C27B0);
  static const Color rarityLegend = Color(0xFFFF4500);

  // --- Transparences utilitaires ---
  static Color withAlpha25(Color base) => base.withAlpha(25);
  static Color withAlpha40(Color base) => base.withAlpha(40);
  static Color withAlpha76(Color base) => base.withAlpha(76);
  static Color withAlpha128(Color base) => base.withAlpha(128);
  static Color withAlpha179(Color base) => base.withAlpha(179);
}