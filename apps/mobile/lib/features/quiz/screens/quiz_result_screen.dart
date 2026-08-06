import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../../../theme/wilo_theme.dart';

/// Écran de résultat du quiz (M5).
///
/// Reçoit les arguments :
/// - score (int)
/// - total (int)
/// - correct (int)
/// - totalQuestions (int)
///
/// Affiche :
/// - Cercle de progression avec pourcentage
/// - Statistiques détaillées
/// - Carte de résultat partageable visuellement
/// - Boutons : Rejouer, Accueil, Partager
class QuizResultScreen extends StatelessWidget {
  const QuizResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final int score = args['score'] as int;
    final int total = args['total'] as int;
    final int correct = args['correct'] as int;
    final int totalQuestions = args['totalQuestions'] as int;
    final double percentage = total > 0 ? (score / total * 100) : 0;
    final int incorrect = totalQuestions - correct;
    // Temps mocké (à remplacer par données réelles du serveur)
    final String timeSpent = '2:34';
    final String avgTime = '15.4s';

    return Scaffold(
      backgroundColor: WiloColors.bgPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(WiloSpacing.screenPaddingX),
          child: Column(
            children: [
              const SizedBox(height: WiloSpacing.space8),
              // Icône victoire/défaite
              Icon(
                percentage >= 50 ? Icons.emoji_events : Icons.sentiment_dissatisfied,
                size: 72,
                color: percentage >= 50 ? WiloColors.gold500 : WiloColors.error,
              ),
              const SizedBox(height: WiloSpacing.space4),
              Text(
                percentage >= 50 ? 'Bien joué !' : 'Essaie encore !',
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      color: percentage >= 50 ? WiloColors.gold500 : WiloColors.error,
                    ),
              ),
              const SizedBox(height: WiloSpacing.space2),
              Text(
                'Score final',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: WiloSpacing.space6),

              // Cercle de progression
              SizedBox(
                width: 160,
                height: 160,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    CircularProgressIndicator(
                      value: percentage / 100,
                      strokeWidth: 10,
                      backgroundColor: WiloColors.bgSecondary,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        percentage >= 50 ? WiloColors.success : WiloColors.error,
                      ),
                    ),
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '$score',
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          '/ $total',
                          style: const TextStyle(
                            fontSize: 16,
                            color: Colors.white54,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: WiloSpacing.space4),
              Text(
                '${percentage.toStringAsFixed(0)}%',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: WiloColors.blue500,
                ),
              ),
              const SizedBox(height: WiloSpacing.space8),

              // Statistiques
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(WiloSpacing.cardPadding),
                decoration: BoxDecoration(
                  color: WiloColors.bgSecondary,
                  borderRadius: BorderRadius.circular(WiloRadii.lg),
                ),
                child: Column(
                  children: [
                    _StatRow(
                      icon: Icons.check_circle,
                      label: 'Bonnes réponses',
                      value: '$correct / $totalQuestions',
                      color: WiloColors.success,
                    ),
                    const SizedBox(height: WiloSpacing.space3),
                    _StatRow(
                      icon: Icons.cancel,
                      label: 'Mauvaises réponses',
                      value: '$incorrect / $totalQuestions',
                      color: WiloColors.error,
                    ),
                    const SizedBox(height: WiloSpacing.space3),
                    _StatRow(
                      icon: Icons.timer,
                      label: 'Temps total',
                      value: timeSpent,
                      color: WiloColors.blue500,
                    ),
                    const SizedBox(height: WiloSpacing.space3),
                    _StatRow(
                      icon: Icons.speed,
                      label: 'Temps moyen/question',
                      value: avgTime,
                      color: WiloColors.warning,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: WiloSpacing.space8),

              // Carte de résultat partageable (aperçu)
              _ShareableResultCard(
                score: score,
                total: total,
                correct: correct,
                totalQuestions: totalQuestions,
                percentage: percentage,
                timeSpent: timeSpent,
              ),
              const SizedBox(height: WiloSpacing.space8),

              // Boutons d'action
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        // Rejouer : retour à la sélection
                        Navigator.of(context).pushReplacementNamed('/quiz');
                      },
                      icon: const Icon(Icons.replay),
                      label: const Text('Rejouer'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: WiloColors.blue500,
                      ),
                    ),
                  ),
                  const SizedBox(width: WiloSpacing.space3),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        // Partager
                        _shareResult(score, total, correct, totalQuestions, percentage, timeSpent);
                      },
                      icon: const Icon(Icons.share),
                      label: const Text('Partager'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: WiloColors.gold500,
                        foregroundColor: WiloColors.bgPrimary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: WiloSpacing.space3),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: TextButton(
                  onPressed: () {
                    Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
                  },
                  child: const Text('Retour à l\'accueil'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _shareResult(int score, int total, int correct, int totalQuestions,
      double percentage, String timeSpent) {
    final text = '''
🏆 WI-LO — Résultat de mon quiz !

Score : $score / $total
Bonnes réponses : $correct / $totalQuestions
Temps : $timeSpent
Précision : ${percentage.toStringAsFixed(0)}%

Télécharge WI-LO et défie-moi !
''';
    Share.share(text, subject: 'Mon résultat WI-LO');
  }
}

// ---------------------------------------------------------------------------
// Widgets privés
// ---------------------------------------------------------------------------

class _StatRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(width: WiloSpacing.space2),
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w700,
                color: color,
              ),
        ),
      ],
    );
  }
}

class _ShareableResultCard extends StatelessWidget {
  final int score;
  final int total;
  final int correct;
  final int totalQuestions;
  final double percentage;
  final String timeSpent;

  const _ShareableResultCard({
    required this.score,
    required this.total,
    required this.correct,
    required this.totalQuestions,
    required this.percentage,
    required this.timeSpent,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(WiloSpacing.cardPadding),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [WiloColors.blue500, WiloColors.blue700],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(WiloRadii.lg),
        boxShadow: [
          BoxShadow(
            color: WiloColors.blue500.withAlpha(60),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.sports_esports, color: Colors.white, size: 28),
              SizedBox(width: 8),
              Text(
                'WI-LO',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2,
                ),
              ),
            ],
          ),
          const SizedBox(height: WiloSpacing.space4),
          Text(
            '$score pts',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 48,
              fontWeight: FontWeight.w900,
            ),
          ),
          Text(
            '$correct/$totalQuestions réponses correctes',
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: WiloSpacing.space3),
          Text(
            '${percentage.toStringAsFixed(0)}% de précision • $timeSpent',
            style: const TextStyle(
              color: Colors.white60,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}