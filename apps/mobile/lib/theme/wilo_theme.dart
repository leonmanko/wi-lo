import 'package:flutter/material.dart';

/// Tokens de couleurs officiels WI-LO — Sprint 4B.
class WiloColors {
  WiloColors._();

  static const Color blue50 = Color(0xFFEBF0FF);
  static const Color blue100 = Color(0xFFD0DCFF);
  static const Color blue200 = Color(0xFFA3BCFF);
  static const Color blue300 = Color(0xFF7099FF);
  static const Color blue400 = Color(0xFF4A7AFF);
  static const Color blue500 = Color(0xFF2563EB);
  static const Color blue600 = Color(0xFF1D4ED8);
  static const Color blue700 = Color(0xFF1E40AF);

  static const Color gold400 = Color(0xFFFFC01F);
  static const Color gold500 = Color(0xFFF5A623);

  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);

  static const Color sportFootball = Color(0xFF4A90FF);
  static const Color sportBasketball = Color(0xFFFF6B35);
  static const Color sportTennis = Color(0xFFFFD700);
  static const Color sportRugby = Color(0xFF2EC4B6);
  static const Color sportF1 = Color(0xFFE63946);
  static const Color sportCombat = Color(0xFFFF4500);

  static const Color rarityBronze = Color(0xFFCD7F32);
  static const Color raritySilver = Color(0xFFC0C0C0);
  static const Color rarityGold = Color(0xFFFFD700);
  static const Color rarityLegend = Color(0xFFFF4500);

  static const Color bgPrimary = Color(0xFF0A0E1A);
  static const Color bgSecondary = Color(0xFF111827);
  static const Color bgTertiary = Color(0xFF1A2235);
}

class WiloSpacing {
  WiloSpacing._();

  static const double space1 = 4;
  static const double space2 = 8;
  static const double space3 = 12;
  static const double space4 = 16;
  static const double space5 = 20;
  static const double space6 = 24;
  static const double space8 = 32;
  static const double screenPaddingX = 16;
  static const double cardPadding = 16;
}

class WiloRadii {
  WiloRadii._();

  static const double sm = 4;
  static const double md = 8;
  static const double lg = 12;
  static const double xl = 16;
  static const double full = 9999;
}

class WiloDurations {
  WiloDurations._();

  static const Duration instant = Duration(milliseconds: 100);
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 250);
  static const Duration slow = Duration(milliseconds: 400);
  static const Duration reward = Duration(milliseconds: 2000);
  static const Duration packOpen = Duration(milliseconds: 6000);
}

class WiloTheme {
  WiloTheme._();

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: WiloColors.blue500,
      scaffoldBackgroundColor: WiloColors.bgPrimary,
      fontFamily: 'Inter',
      colorScheme: const ColorScheme.dark(
        primary: WiloColors.blue500,
        secondary: WiloColors.gold500,
        surface: WiloColors.bgSecondary,
        error: WiloColors.error,
        onPrimary: Colors.white,
        onSecondary: WiloColors.bgPrimary,
        onSurface: Colors.white,
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: WiloColors.bgPrimary,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
    );
  }
}