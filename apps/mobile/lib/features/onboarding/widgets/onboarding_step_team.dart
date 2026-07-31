import 'package:flutter/material.dart';
import '../../../theme/wilo_theme.dart';

/// ONB3 — Choix de l'équipe favorite (optionnel, skippable).
///
/// Affiche un champ texte libre (pas de logo réel).
/// Conforme à la règle : jamais de logo/club sous licence.
class OnboardingStepTeam extends StatelessWidget {
  const OnboardingStepTeam({
    super.key,
    required this.selectedSport,
    this.selectedTeam,
    required this.onTeamSelected,
    required this.onNext,
    required this.onSkip,
  });

  final String? selectedSport;
  final String? selectedTeam;
  final void Function(String? team) onTeamSelected;
  final VoidCallback onNext;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: WiloSpacing.screenPaddingX),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Ton équipe favorite ?',
            style: Theme.of(context).textTheme.headlineLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: WiloSpacing.space2),
          Text(
            'Optionnel — utilisé pour les Derby Days.',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: WiloSpacing.space8),
          // Champ texte
          TextField(
            onChanged: (value) => onTeamSelected(value.isEmpty ? null : value.trim()),
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Nom de ton équipe',
              hintStyle: const TextStyle(color: Colors.white38),
              prefixIcon: Icon(
                Icons.shield_outlined,
                color: _getSportColor(),
              ),
            ),
          ),
          const SizedBox(height: WiloSpacing.space2),
          Text(
            'Aucun logo officiel ne sera affiché.',
            style: TextStyle(
              color: Colors.white.withAlpha(80),
              fontSize: 11,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: WiloSpacing.space8),
          // Bouton Continuer
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton(
              onPressed: onNext,
              child: const Text('Continuer'),
            ),
          ),
          const SizedBox(height: WiloSpacing.space3),
          // Bouton Passer
          SizedBox(
            width: double.infinity,
            height: 44,
            child: TextButton(
              onPressed: onSkip,
              child: const Text(
                'Passer',
                style: TextStyle(color: Colors.white54),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getSportColor() {
    switch (selectedSport) {
      case 'Football':
        return WiloColors.sportFootball;
      case 'Basketball':
        return WiloColors.sportBasketball;
      case 'Tennis':
        return WiloColors.sportTennis;
      case 'Rugby':
        return WiloColors.sportRugby;
      case 'F1':
        return WiloColors.sportF1;
      default:
        return WiloColors.blue500;
    }
  }
}