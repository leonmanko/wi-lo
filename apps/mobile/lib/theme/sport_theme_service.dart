import 'package:flutter/material.dart';
import 'wilo_theme.dart';

/// Service de personnalisation du thème selon le sport favori.
///
/// Adapte les couleurs d'accent de l'interface en fonction du sport choisi.
/// Utilise les tokens officiels du Sprint 4B.
class SportThemeService {
  SportThemeService._();

  /// Retourne la couleur primaire associée à un sport.
  static Color getPrimaryColor(String? sport) {
    return _getSportData(sport).primary;
  }

  /// Retourne la couleur secondaire associée à un sport.
  static Color getSecondaryColor(String? sport) {
    return _getSportData(sport).secondary;
  }

  /// Retourne un dégradé associé à un sport (pour les fonds, bannières).
  static LinearGradient getGradient(String? sport) {
    final data = _getSportData(sport);
    return LinearGradient(
      colors: [data.primary, data.secondary],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  /// Retourne une ombre glow associée à un sport.
  static BoxShadow getGlowShadow(String? sport) {
    final color = _getSportData(sport).primary;
    return BoxShadow(
      color: color.withAlpha(60),
      blurRadius: 20,
      spreadRadius: 2,
    );
  }

  /// Retourne l'emoji associé à un sport.
  static String getEmoji(String? sport) {
    return _getSportData(sport).emoji;
  }

  /// Retourne le nom affichable du sport.
  static String getDisplayName(String? sport) {
    return _getSportData(sport).displayName;
  }

  /// Retourne la liste de tous les sports disponibles.
  static List<String> get availableSports => _sportMap.keys.toList();

  // ---------------------------------------------------------------------------
  // Données internes
  // ---------------------------------------------------------------------------

  static _SportThemeData _getSportData(String? sport) {
    return _sportMap[sport] ?? _sportMap['default']!;
  }

  static final Map<String, _SportThemeData> _sportMap = {
    'Football': _SportThemeData(
      primary: WiloColors.sportFootball,
      secondary: const Color(0xFF2E5FB0),
      emoji: '⚽',
      displayName: 'Football',
    ),
    'Basketball': _SportThemeData(
      primary: WiloColors.sportBasketball,
      secondary: const Color(0xFFCC4422),
      emoji: '🏀',
      displayName: 'Basketball',
    ),
    'Tennis': _SportThemeData(
      primary: WiloColors.sportTennis,
      secondary: const Color(0xFFCCA000),
      emoji: '🎾',
      displayName: 'Tennis',
    ),
    'Rugby': _SportThemeData(
      primary: WiloColors.sportRugby,
      secondary: const Color(0xFF1A8A7A),
      emoji: '🏉',
      displayName: 'Rugby',
    ),
    'F1': _SportThemeData(
      primary: WiloColors.sportF1,
      secondary: const Color(0xFFB02020),
      emoji: '🏎️',
      displayName: 'F1',
    ),
    'MMA': _SportThemeData(
      primary: WiloColors.sportCombat,
      secondary: const Color(0xFFCC3300),
      emoji: '🥊',
      displayName: 'MMA',
    ),
    'default': _SportThemeData(
      primary: WiloColors.blue500,
      secondary: WiloColors.blue700,
      emoji: '🏆',
      displayName: 'Sport',
    ),
  };
}

/// Données de thème pour un sport.
class _SportThemeData {
  final Color primary;
  final Color secondary;
  final String emoji;
  final String displayName;

  const _SportThemeData({
    required this.primary,
    required this.secondary,
    required this.emoji,
    required this.displayName,
  });
}