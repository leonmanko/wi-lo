import 'package:flutter/material.dart';
import '../../../theme/wilo_theme.dart';

/// ONB2 — Choix du sport favori.
///
/// Affiche une grille de 6 sports (conforme au design : football, basketball,
/// tennis, rugby, F1, combat/MMA).
class OnboardingStepSport extends StatelessWidget {
  const OnboardingStepSport({
    super.key,
    required this.selectedSport,
    required this.onSportSelected,
    required this.onNext,
  });

  final String? selectedSport;
  final void Function(String sport) onSportSelected;
  final VoidCallback onNext;

  static const _sports = [
    _SportData('Football', '⚽', WiloColors.sportFootball),
    _SportData('Basketball', '🏀', WiloColors.sportBasketball),
    _SportData('Tennis', '🎾', WiloColors.sportTennis),
    _SportData('Rugby', '🏉', WiloColors.sportRugby),
    _SportData('F1', '🏎️', WiloColors.sportF1),
    _SportData('MMA', '🥊', WiloColors.sportCombat),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: WiloSpacing.screenPaddingX),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Choisis ton sport favori',
            style: Theme.of(context).textTheme.headlineLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: WiloSpacing.space2),
          Text(
            'Les questions seront adaptées à ton sport.',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: WiloSpacing.space8),
          // Grille 3×2
          GridView.count(
            crossAxisCount: 3,
            mainAxisSpacing: WiloSpacing.space3,
            crossAxisSpacing: WiloSpacing.space3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: _sports.map((sport) {
              final isSelected = selectedSport == sport.name;
              return GestureDetector(
                onTap: () => onSportSelected(sport.name),
                child: AnimatedContainer(
                  duration: WiloDurations.normal,
                  decoration: BoxDecoration(
                    color: isSelected
                        ? sport.color.withAlpha(30)
                        : WiloColors.bgSecondary,
                    borderRadius: BorderRadius.circular(WiloRadii.lg),
                    border: Border.all(
                      color: isSelected ? sport.color : Colors.transparent,
                      width: 2,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: sport.color.withAlpha(30),
                              blurRadius: 12,
                              spreadRadius: 1,
                            ),
                          ]
                        : null,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(sport.emoji, style: const TextStyle(fontSize: 32)),
                      const SizedBox(height: WiloSpacing.space2),
                      Text(
                        sport.name,
                        style: TextStyle(
                          color: isSelected ? sport.color : Colors.white,
                          fontWeight:
                              isSelected ? FontWeight.w700 : FontWeight.w500,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: WiloSpacing.space8),
          // Bouton Continuer
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton(
              onPressed: selectedSport != null ? onNext : null,
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    selectedSport != null ? WiloColors.blue500 : WiloColors.blue200,
              ),
              child: const Text('Continuer'),
            ),
          ),
        ],
      ),
    );
  }
}

class _SportData {
  final String name;
  final String emoji;
  final Color color;
  const _SportData(this.name, this.emoji, this.color);
}