import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../theme/wilo_theme.dart';
import '../../../theme/sport_theme_provider.dart';
import '../widgets/onboarding_step_logo.dart';
import '../widgets/onboarding_step_sport.dart';
import '../widgets/onboarding_step_team.dart';
import '../widgets/onboarding_step_tuto.dart';

/// Écran d'onboarding cinématique — 4 étapes.
///
/// États couverts :
/// - ONB1 : Logo animé (2.5s, auto-advance)
/// - ONB2 : Choix sport favori
/// - ONB3 : Choix équipe (skippable)
/// - ONB4 : Didacticiel 3 slides + bouton "C'est parti !"
/// - Terminé : callback onOnboardingComplete()
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({
    super.key,
    this.onOnboardingComplete,
  });

  /// Callback appelé quand l'onboarding est terminé.
  final VoidCallback? onOnboardingComplete;

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen>
    with SingleTickerProviderStateMixin {
  final _pageController = PageController();
  int _currentPage = 0;
  String? _selectedSport;
  String? _selectedTeam;

  // Animation pour la transition entre étapes
  late final AnimationController _transitionController;

  // Pages (ordre fixe conforme au design)
  static const _pageCount = 4;

  @override
  void initState() {
    super.initState();
    _transitionController = AnimationController(
      vsync: this,
      duration: WiloDurations.slow,
    );

    // ONB1 : auto-advance après 2.5 secondes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(milliseconds: 2500), () {
        if (mounted && _currentPage == 0) {
          _goToNextPage();
        }
      });
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    _transitionController.dispose();
    super.dispose();
  }

  void _goToNextPage() {
    if (_currentPage < _pageCount - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    } else {
      _completeOnboarding();
    }
  }

  void _completeOnboarding() {
    // Haptique de confirmation
    HapticFeedback.mediumImpact();

    // Sauvegarder le sport favori pour les prochains lancements
    if (_selectedSport != null) {
      SportPreferenceService.save(_selectedSport!);
    }
    if (_selectedTeam != null) {
      // TODO: Sauvegarder l'équipe favorite (Sprint 25)
    }

    widget.onOnboardingComplete?.call();
  }

  void _onSportSelected(String sport) {
    setState(() => _selectedSport = sport);
    HapticFeedback.lightImpact();

    // Appliquer immédiatement la couleur du sport
    ref.read(selectedSportProvider.notifier).state = sport;
  }

  void _onTeamSelected(String? team) {
    setState(() => _selectedTeam = team);
  }

  void _skipToEnd() {
    _pageController.animateToPage(
      _pageCount - 1,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WiloColors.bgPrimary,
      body: SafeArea(
        child: Stack(
          children: [
            // Contenu principal
            PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              onPageChanged: (page) {
                setState(() => _currentPage = page);
              },
              children: [
                // ONB1 : Logo animé
                const OnboardingStepLogo(),

                // ONB2 : Choix sport
                OnboardingStepSport(
                  selectedSport: _selectedSport,
                  onSportSelected: _onSportSelected,
                  onNext: _goToNextPage,
                ),

                // ONB3 : Choix équipe
                OnboardingStepTeam(
                  selectedSport: _selectedSport,
                  selectedTeam: _selectedTeam,
                  onTeamSelected: _onTeamSelected,
                  onNext: _goToNextPage,
                  onSkip: _skipToEnd,
                ),

                // ONB4 : Didacticiel
                OnboardingStepTuto(
                  selectedSport: _selectedSport,
                  onComplete: _completeOnboarding,
                ),
              ],
            ),

            // Indicateur de progression (sauf ONB1)
            if (_currentPage > 0)
              Positioned(
                top: 16,
                left: 0,
                right: 0,
                child: _ProgressIndicator(
                  currentPage: _currentPage,
                  totalPages: _pageCount - 1, // ONB1 exclu du décompte
                ),
              ),

            // Bouton "Passer" (ONB2 et ONB3 uniquement)
            if (_currentPage == 2)
              Positioned(
                top: 16,
                right: 16,
                child: TextButton(
                  onPressed: _skipToEnd,
                  child: const Text(
                    'Passer',
                    style: TextStyle(color: Colors.white54),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Indicateur de progression simple.
class _ProgressIndicator extends StatelessWidget {
  const _ProgressIndicator({
    required this.currentPage,
    required this.totalPages,
  });

  final int currentPage;
  final int totalPages;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(totalPages, (index) {
        final isActive = index + 1 <= currentPage; // +1 car ONB1 = page 0
        return AnimatedContainer(
          duration: WiloDurations.normal,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: isActive ? 24 : 8,
          height: 4,
          decoration: BoxDecoration(
            color: isActive ? WiloColors.blue500 : Colors.white.withAlpha(50),
            borderRadius: BorderRadius.circular(WiloRadii.full),
          ),
        );
      }),
    );
  }
}