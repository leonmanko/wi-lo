import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// État des paramètres du quiz
class QuizParamsState {
  final List<String> sports;
  final List<String> categories;
  final String? selectedSport;
  final String? selectedCategory;
  final String difficulty; // 'easy', 'medium', 'hard'
  final int questionCount;
  final bool isLoading;
  final String? error;

  const QuizParamsState({
    this.sports = const [],
    this.categories = const [],
    this.selectedSport,
    this.selectedCategory,
    this.difficulty = 'medium',
    this.questionCount = 10,
    this.isLoading = false,
    this.error,
  });

  QuizParamsState copyWith({
    List<String>? sports,
    List<String>? categories,
    String? selectedSport,
    String? selectedCategory,
    String? difficulty,
    int? questionCount,
    bool? isLoading,
    String? error,
  }) {
    return QuizParamsState(
      sports: sports ?? this.sports,
      categories: categories ?? this.categories,
      selectedSport: selectedSport ?? this.selectedSport,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      difficulty: difficulty ?? this.difficulty,
      questionCount: questionCount ?? this.questionCount,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Notifier pour gérer les paramètres du quiz
class QuizParamsNotifier extends StateNotifier<QuizParamsState> {
  QuizParamsNotifier() : super(const QuizParamsState());

  /// Charge la liste des sports (simulée pour le moment)
  Future<void> loadSports() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // TODO: Remplacer par l'appel API réel (Sprint 5)
      await Future.delayed(const Duration(milliseconds: 500));
      state = state.copyWith(
        isLoading: false,
        sports: ['Football', 'Basketball', 'Tennis', 'Rugby', 'F1', 'MMA'],
        selectedSport: null,
        selectedCategory: null,
        categories: [],
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Impossible de charger les sports.',
      );
    }
  }

  /// Sélectionne un sport et charge ses catégories
  Future<void> selectSport(String? sport) async {
    state = state.copyWith(selectedSport: sport, selectedCategory: null, categories: []);
    if (sport == null) return;
    state = state.copyWith(isLoading: true);
    try {
      // TODO: Remplacer par l'appel API réel (Sprint 5)
      await Future.delayed(const Duration(milliseconds: 300));
      final cats = _mockCategories(sport);
      state = state.copyWith(isLoading: false, categories: cats);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Impossible de charger les catégories.');
    }
  }

  void selectCategory(String? category) {
    state = state.copyWith(selectedCategory: category);
  }

  void setDifficulty(String difficulty) {
    state = state.copyWith(difficulty: difficulty);
  }

  void setQuestionCount(int count) {
    state = state.copyWith(questionCount: count);
  }

  /// Lance le quiz (navigue vers l'écran de jeu)
  void startQuiz(BuildContext context) {
    if (state.selectedSport == null || state.selectedCategory == null) return;

    // TODO: Naviguer vers l'écran de jeu (Sprint 6 - M3/M4)
    Navigator.of(context).pushNamed('/quiz/play', arguments: {
      'sport': state.selectedSport,
      'category': state.selectedCategory,
      'difficulty': state.difficulty,
      'questionCount': state.questionCount,
    });
  }

  // Données mockées en attendant le backend
  List<String> _mockCategories(String sport) {
    switch (sport) {
      case 'Football':
        return ['Histoire', 'Joueurs', 'Compétitions', 'Records'];
      case 'Basketball':
        return ['NBA', 'Euroleague', 'Joueurs', 'Histoire'];
      case 'Tennis':
        return ['Grand Chelem', 'Joueurs', 'Records', 'Histoire'];
      default:
        return ['Général', 'Histoire', 'Records'];
    }
  }
}

/// Provider pour l'état des paramètres
final quizParamsProvider = StateNotifierProvider<QuizParamsNotifier, QuizParamsState>((ref) {
  final notifier = QuizParamsNotifier();
  // Charger les sports au démarrage
  Future.microtask(() => notifier.loadSports());
  return notifier;
});