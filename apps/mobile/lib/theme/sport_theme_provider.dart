import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'sport_theme_service.dart';
import 'package:flutter/material.dart';

/// Provider Riverpod pour le sport favori et les couleurs associées.
///
/// Persiste le choix dans SharedPreferences pour application immédiate
/// à chaque lancement.

/// Le sport sélectionné (string). Null = pas encore choisi.
final selectedSportProvider = StateProvider<String?>((ref) => null);

/// La couleur primaire du sport (réactive, se met à jour automatiquement).
final sportPrimaryColorProvider = Provider<Color>((ref) {
  final sport = ref.watch(selectedSportProvider);
  return SportThemeService.getPrimaryColor(sport);
});

/// La couleur secondaire du sport.
final sportSecondaryColorProvider = Provider<Color>((ref) {
  final sport = ref.watch(selectedSportProvider);
  return SportThemeService.getSecondaryColor(sport);
});

/// Le dégradé du sport.
final sportGradientProvider = Provider<LinearGradient>((ref) {
  final sport = ref.watch(selectedSportProvider);
  return SportThemeService.getGradient(sport);
});

/// L'emoji du sport.
final sportEmojiProvider = Provider<String>((ref) {
  final sport = ref.watch(selectedSportProvider);
  return SportThemeService.getEmoji(sport);
});

/// L'ombre glow du sport.
final sportGlowProvider = Provider<BoxShadow>((ref) {
  final sport = ref.watch(selectedSportProvider);
  return SportThemeService.getGlowShadow(sport);
});

/// Service de persistance du sport favori.
class SportPreferenceService {
  static const _key = 'favorite_sport';

  /// Sauvegarde le sport favori.
  static Future<void> save(String sport) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, sport);
  }

  /// Charge le sport favori sauvegardé.
  static Future<String?> load() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_key);
  }
}