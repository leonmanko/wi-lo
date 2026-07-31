import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../theme/wilo_theme.dart';

/// ONB4 — Didacticiel 3 slides + bouton "C'est parti !"
class OnboardingStepTuto extends StatefulWidget {
  const OnboardingStepTuto({
    super.key,
    required this.selectedSport,
    required this.onComplete,
  });

  final String? selectedSport;
  final VoidCallback onComplete;

  @override
  State<OnboardingStepTuto> createState() => _OnboardingStepTutoState();
}

class _OnboardingStepTutoState extends State<OnboardingStepTuto> {
  late final PageController _tutoController;
  int _tutoPage = 0;

  static const _tutoPages = [
    _TutoPageData(
      emoji: '🧠',
      title: 'Teste tes connaissances',
      description: 'Des milliers de questions générées par IA,\nan crées sur l\'actualité sportive réelle.',
    ),
    _TutoPageData(
      emoji: '⚔️',
      title: 'Défie tes amis',
      description: 'Duels en temps réel, classements,\net collection de cartes WI-LO Legends.',
    ),
    _TutoPageData(
      emoji: '🏆',
      title: 'Collectionne les légendes',
      description: 'Ouvre des packs, collectionne des personnages\nuniques et deviens une légende WI-LO.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tutoController = PageController();
  }

  @override
  void dispose() {
    _tutoController.dispose();
    super.dispose();
  }

  void _goToNextTutoPage() {
    if (_tutoPage < _tutoPages.length - 1) {
      _tutoController.nextPage(
        duration: WiloDurations.normal,
        curve: Curves.easeOut,
      );
    } else {
      HapticFeedback.mediumImpact();
      widget.onComplete();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: WiloSpacing.screenPaddingX),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Slides du tuto
          SizedBox(
            height: 250,
            child: PageView.builder(
              controller: _tutoController,
              itemCount: _tutoPages.length,
              onPageChanged: (page) => setState(() => _tutoPage = page),
              itemBuilder: (context, index) {
                final page = _tutoPages[index];
                return Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(page.emoji, style: const TextStyle(fontSize: 56)),
                    const SizedBox(height: WiloSpacing.space6),
                    Text(
                      page.title,
                      style: Theme.of(context).textTheme.titleLarge,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: WiloSpacing.space3),
                    Text(
                      page.description,
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                  ],
                );
              },
            ),
          ),

          // Indicateur de page tuto
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_tutoPages.length, (index) {
              return AnimatedContainer(
                duration: WiloDurations.normal,
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: index == _tutoPage ? 16 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: index == _tutoPage
                      ? WiloColors.blue500
                      : Colors.white.withAlpha(50),
                  borderRadius: BorderRadius.circular(WiloRadii.full),
                ),
              );
            }),
          ),
          const SizedBox(height: WiloSpacing.space8),

          // Bouton CTA Hero
          SizedBox(
            width: double.infinity,
            height: 72,
            child: ElevatedButton(
              onPressed: _goToNextTutoPage,
              style: ElevatedButton.styleFrom(
                backgroundColor: WiloColors.gold500,
                foregroundColor: WiloColors.bgPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(WiloRadii.lg),
                ),
                textStyle: const TextStyle(
                  fontFamily: 'Stadium Bold',
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
                elevation: 0,
              ),
              child: Text(
                _tutoPage < _tutoPages.length - 1 ? 'Suivant' : 'C\'est parti !',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TutoPageData {
  final String emoji;
  final String title;
  final String description;
  const _TutoPageData({
    required this.emoji,
    required this.title,
    required this.description,
  });
}