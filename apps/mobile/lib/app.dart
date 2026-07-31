import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/tokens/app_colors.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/mfa_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'features/profile/screens/edit_profile_screen.dart';
import 'features/onboarding/screens/onboarding_screen.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/auth/providers/auth_state.dart';
import 'core/tokens/app_spacing.dart';
import 'core/tokens/app_typography.dart';
import 'theme/sport_theme_provider.dart';

class WiLoApp extends StatelessWidget {
  const WiLoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WI-LO',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: AppColors.accentPrimary,
        scaffoldBackgroundColor: AppColors.backgroundPrimary,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.accentPrimary,
          secondary: AppColors.accentPrimary,
          surface: AppColors.backgroundSecondary,
          error: AppColors.accentError,
          onPrimary: AppColors.backgroundPrimary,
          onSecondary: AppColors.backgroundPrimary,
          onSurface: AppColors.textPrimary,
          onError: AppColors.textPrimary,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.backgroundPrimary,
          foregroundColor: AppColors.textPrimary,
          elevation: 0,
          centerTitle: true,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.backgroundSecondary,
          labelStyle: const TextStyle(color: AppColors.textSecondary),
          hintStyle: const TextStyle(color: AppColors.textTertiary),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            borderSide: BorderSide(
              color: AppColors.textTertiary.withAlpha(76),
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            borderSide: const BorderSide(
              color: AppColors.accentPrimary,
              width: 2,
            ),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            borderSide: const BorderSide(color: AppColors.accentError),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            borderSide: const BorderSide(color: AppColors.accentError, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.md,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.accentPrimary,
            foregroundColor: AppColors.backgroundPrimary,
            disabledBackgroundColor: AppColors.accentPrimary.withAlpha(76),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            minimumSize: const Size(double.infinity, AppSpacing.buttonHeight),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.textPrimary,
            side: const BorderSide(color: AppColors.textTertiary),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: AppColors.accentPrimary,
          ),
        ),
        checkboxTheme: CheckboxThemeData(
          fillColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return AppColors.accentPrimary;
            }
            return null;
          }),
          checkColor: WidgetStateProperty.all(AppColors.backgroundPrimary),
          side: const BorderSide(color: AppColors.textTertiary, width: 2),
        ),
        snackBarTheme: SnackBarThemeData(
          backgroundColor: AppColors.surfaceElevated,
          contentTextStyle: const TextStyle(color: AppColors.textPrimary),
        ),
        dialogTheme: DialogThemeData(
          backgroundColor: AppColors.backgroundSecondary,
          titleTextStyle: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
          contentTextStyle: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 14,
          ),
        ),
        dividerTheme: const DividerThemeData(
          color: AppColors.textTertiary,
          thickness: 1,
        ),
        progressIndicatorTheme: const ProgressIndicatorThemeData(
          color: AppColors.accentPrimary,
        ),
      ),
      initialRoute: '/',
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/login':
            return MaterialPageRoute(
              builder: (_) => const LoginScreen(),
              settings: settings,
            );
          case '/profile':
            return MaterialPageRoute(
              builder: (_) => const ProfileScreen(),
              settings: settings,
            );
          case '/profile/edit':
            return MaterialPageRoute(
              builder: (_) => const EditProfileScreen(),
              settings: settings,
            );
          case '/mfa':
            return MaterialPageRoute(
              builder: (_) => const MfaScreen(),
              settings: settings,
            );
          default:
            return null;
        }
      },
      home: const _AppEntryPoint(),
    );
  }
}

class _AppEntryPoint extends ConsumerWidget {
  const _AppEntryPoint();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    // Charger le sport favori sauvegardé et vérifier la session au démarrage
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      // Charger le sport favori sauvegardé
      final savedSport = await SportPreferenceService.load();
      if (savedSport != null) {
        ref.read(selectedSportProvider.notifier).state = savedSport;
      }
      ref.read(authProvider.notifier).checkSession();
    });

    // Si authentifié → écran d'accueil (à créer au Sprint 6)
    if (authState is Authenticated) {
      // TODO: Sprint 6 — Remplacer par HomeScreen
      return const Scaffold(
        backgroundColor: AppColors.backgroundPrimary,
        body: Center(
          child: Text(
            'Bienvenue !',
            style: TextStyle(color: AppColors.textPrimary),
          ),
        ),
      );
    }

    // Si session vérifiée et non authentifié → onboarding ou login
    if (authState is Unauthenticated) {
      // TODO: Vérifier si l'onboarding a déjà été fait (SharedPreferences)
      // Pour l'instant : afficher l'onboarding
      return OnboardingScreen(
        onOnboardingComplete: () {
          // Rediriger vers le login après l'onboarding
          Navigator.of(context).pushReplacementNamed('/login');
        },
      );
    }

    // État initial ou chargement → splash
    return const _SplashScreen();
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.sports_esports,
              size: AppSpacing.iconSizeXl,
              color: AppColors.accentPrimary,
            ),
            SizedBox(height: AppSpacing.lg),
            Text(
              'WI-LO',
              style: AppTypography.display,
            ),
            SizedBox(height: AppSpacing.lg),
            SizedBox(
              width: AppSpacing.lg,
              height: AppSpacing.lg,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: AppColors.accentPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}