import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../theme/wilo_theme.dart';

/// Écran de jeu du quiz (M4).
///
/// Affiche une question à la fois avec :
/// - Timer visuel (affichage uniquement, le calcul est côté serveur)
/// - Barre de progression
/// - 4 options
/// - Feedback immédiat correct/incorrect
///
/// États : question en cours, réponse sélectionnée, timer écoulé, quiz terminé.
class QuizPlayScreen extends StatefulWidget {
  const QuizPlayScreen({super.key});

  @override
  State<QuizPlayScreen> createState() => _QuizPlayScreenState();
}

class _QuizPlayScreenState extends State<QuizPlayScreen> {
  int _currentQuestion = 0;
  int _score = 0;
  int? _selectedIndex;
  bool _hasAnswered = false;
  int _timeLeft = 15; // secondes, contrôlé serveur en prod

  // Données mockées en attendant le backend
  final _questions = _mockQuestions;

  @override
  void dispose() {
    super.dispose();
  }

  void _selectAnswer(int index) {
    if (_hasAnswered) return;
    HapticFeedback.lightImpact();

    setState(() {
      _selectedIndex = index;
      _hasAnswered = true;
      if (_questions[_currentQuestion].correctIndex == index) {
        _score += 10;
      }
    });

    Future.delayed(const Duration(milliseconds: 800), () {
      if (!mounted) return;
      if (_currentQuestion < _questions.length - 1) {
        setState(() {
          _currentQuestion++;
          _selectedIndex = null;
          _hasAnswered = false;
          _timeLeft = 15;
        });
      } else {
        // Quiz terminé → résultat
        Navigator.of(context).pushReplacementNamed('/quiz/result', arguments: {
          'score': _score,
          'total': _questions.length * 10,
          'correct': _score ~/ 10,
          'totalQuestions': _questions.length,
        });
      }
    });
  }

  Color _optionColor(int index) {
    if (!_hasAnswered) {
      return WiloColors.bgSecondary;
    }
    if (index == _questions[_currentQuestion].correctIndex) {
      return WiloColors.success;
    }
    if (index == _selectedIndex) {
      return WiloColors.error;
    }
    return WiloColors.bgSecondary;
  }

  @override
  Widget build(BuildContext context) {
    final question = _questions[_currentQuestion];

    return Scaffold(
      backgroundColor: WiloColors.bgPrimary,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text('Question ${_currentQuestion + 1}/${_questions.length}'),
        centerTitle: true,
        actions: [
          // Timer visuel
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Text(
                '⏱ $_timeLeft',
                style: TextStyle(
                  color: _timeLeft <= 5 ? WiloColors.error : Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Barre de progression
          LinearProgressIndicator(
            value: (_currentQuestion + (_hasAnswered ? 1 : 0)) / _questions.length,
            backgroundColor: WiloColors.bgSecondary,
            valueColor: const AlwaysStoppedAnimation(WiloColors.blue500),
            minHeight: 4,
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(WiloSpacing.screenPaddingX),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: WiloSpacing.space8),
                  // En-tête méta
                  Row(
                    children: [
                      const Icon(Icons.sports_soccer, color: WiloColors.blue300, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Football · Moyen',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const Spacer(),
                      Text(
                        'Score : $_score',
                        style: const TextStyle(
                          color: WiloColors.gold500,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: WiloSpacing.space8),
                  // Question
                  Container(
                    padding: const EdgeInsets.all(WiloSpacing.cardPadding),
                    decoration: BoxDecoration(
                      color: WiloColors.bgSecondary,
                      borderRadius: BorderRadius.circular(WiloRadii.lg),
                    ),
                    child: Text(
                      question.text,
                      style: Theme.of(context).textTheme.titleLarge,
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: WiloSpacing.space8),
                  // Options
                  ...List.generate(4, (index) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: WiloSpacing.space3),
                      child: GestureDetector(
                        onTap: () => _selectAnswer(index),
                        child: AnimatedContainer(
                          duration: WiloDurations.normal,
                          padding: const EdgeInsets.all(WiloSpacing.cardPadding),
                          decoration: BoxDecoration(
                            color: _optionColor(index),
                            borderRadius: BorderRadius.circular(WiloRadii.md),
                            border: Border.all(
                              color: _hasAnswered && index == question.correctIndex
                                  ? WiloColors.success
                                  : Colors.transparent,
                              width: 2,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 28,
                                height: 28,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white38),
                                ),
                                child: Text(
                                  ['A', 'B', 'C', 'D'][index],
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const SizedBox(width: WiloSpacing.space3),
                              Expanded(
                                child: Text(
                                  question.options[index],
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                              if (_hasAnswered && index == question.correctIndex)
                                const Icon(Icons.check_circle, color: Colors.white),
                              if (_hasAnswered &&
                                  index == _selectedIndex &&
                                  index != question.correctIndex)
                                const Icon(Icons.cancel, color: Colors.white),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Données mockées
class _MockQuestion {
  final String text;
  final List<String> options;
  final int correctIndex;
  const _MockQuestion(this.text, this.options, this.correctIndex);
}

const _mockQuestions = [
  _MockQuestion(
    'Qui a remporté la Ligue des Champions 2023 ?',
    ['Manchester City', 'Real Madrid', 'Inter Milan', 'Bayern Munich'],
    0,
  ),
  _MockQuestion(
    'Quel joueur a le plus de Ballons d\'Or ?',
    ['Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Zinedine Zidane'],
    1,
  ),
  _MockQuestion(
    'Quel pays a gagné la Coupe du Monde 2018 ?',
    ['Brésil', 'Allemagne', 'France', 'Argentine'],
    2,
  ),
];