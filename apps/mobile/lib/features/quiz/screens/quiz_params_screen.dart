import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../theme/wilo_theme.dart';
import '../providers/quiz_params_provider.dart';

/// Écran de sélection des paramètres du quiz (M2).
///
/// Permet à l'utilisateur de choisir :
/// - Un sport
/// - Une catégorie (selon le sport)
/// - Une difficulté
/// - Un nombre de questions
///
/// États couverts : chargement, erreur, vide (aucun sport), formulaire prêt.
class QuizParamsScreen extends ConsumerStatefulWidget {
  const QuizParamsScreen({super.key});

  @override
  ConsumerState<QuizParamsScreen> createState() => _QuizParamsScreenState();
}

class _QuizParamsScreenState extends ConsumerState<QuizParamsScreen> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(quizParamsProvider);

    return Scaffold(
      backgroundColor: WiloColors.bgPrimary,
      appBar: AppBar(
        title: const Text('Nouveau quiz'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: state.isLoading
            ? const Center(child: CircularProgressIndicator())
            : state.error != null
                ? _ErrorView(
                    message: state.error!,
                    onRetry: () =>
                        ref.read(quizParamsProvider.notifier).loadSports(),
                  )
                : state.sports.isEmpty
                    ? _EmptyView(
                        onRetry: () =>
                            ref.read(quizParamsProvider.notifier).loadSports(),
                      )
                    : _ParamsForm(
                        formKey: _formKey,
                        sports: state.sports,
                        selectedSport: state.selectedSport,
                        onSportChanged: (sport) => ref
                            .read(quizParamsProvider.notifier)
                            .selectSport(sport),
                        categories: state.categories,
                        selectedCategory: state.selectedCategory,
                        onCategoryChanged: (cat) => ref
                            .read(quizParamsProvider.notifier)
                            .selectCategory(cat),
                        difficulty: state.difficulty,
                        onDifficultyChanged: (d) => ref
                            .read(quizParamsProvider.notifier)
                            .setDifficulty(d),
                        questionCount: state.questionCount,
                        onCountChanged: (c) => ref
                            .read(quizParamsProvider.notifier)
                            .setQuestionCount(c),
                        onStart: () {
                          if (_formKey.currentState!.validate()) {
                            ref
                                .read(quizParamsProvider.notifier)
                                .startQuiz(context);
                          }
                        },
                      ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Sous-widgets privés
// ---------------------------------------------------------------------------

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(WiloSpacing.space6),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off, size: 64, color: WiloColors.error),
            const SizedBox(height: WiloSpacing.space4),
            Text(
              message,
              style: Theme.of(context).textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: WiloSpacing.space6),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Réessayer'),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  final VoidCallback onRetry;
  const _EmptyView({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(WiloSpacing.space6),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.sports, size: 64, color: WiloColors.blue300),
            const SizedBox(height: WiloSpacing.space4),
            Text(
              'Aucun sport disponible pour le moment.',
              style: Theme.of(context).textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: WiloSpacing.space6),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Actualiser'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ParamsForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final List<String> sports;
  final String? selectedSport;
  final ValueChanged<String?> onSportChanged;
  final List<String> categories;
  final String? selectedCategory;
  final ValueChanged<String?> onCategoryChanged;
  final String difficulty;
  final ValueChanged<String> onDifficultyChanged;
  final int questionCount;
  final ValueChanged<int> onCountChanged;
  final VoidCallback onStart;

  const _ParamsForm({
    required this.formKey,
    required this.sports,
    required this.selectedSport,
    required this.onSportChanged,
    required this.categories,
    required this.selectedCategory,
    required this.onCategoryChanged,
    required this.difficulty,
    required this.onDifficultyChanged,
    required this.questionCount,
    required this.onCountChanged,
    required this.onStart,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: ListView(
        padding: const EdgeInsets.all(WiloSpacing.screenPaddingX),
        children: [
          // Sport
          _SectionTitle('Sport'),
          const SizedBox(height: WiloSpacing.space2),
          DropdownButtonFormField<String>(
            value: selectedSport,
            isExpanded: true,
            dropdownColor: WiloColors.bgSecondary,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.sports_soccer),
              hintText: 'Choisis un sport',
            ),
            items: sports
                .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                .toList(),
            onChanged: onSportChanged,
            validator: (v) => v == null ? 'Obligatoire' : null,
          ),
          const SizedBox(height: WiloSpacing.space6),

          // Catégorie
          _SectionTitle('Catégorie'),
          const SizedBox(height: WiloSpacing.space2),
          DropdownButtonFormField<String>(
            value: selectedCategory,
            isExpanded: true,
            dropdownColor: WiloColors.bgSecondary,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.category),
              hintText: 'Choisis une catégorie',
            ),
            items: categories
                .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                .toList(),
            onChanged: selectedSport == null ? null : onCategoryChanged,
            validator: (v) => v == null ? 'Obligatoire' : null,
          ),
          const SizedBox(height: WiloSpacing.space6),

          // Difficulté
          _SectionTitle('Difficulté'),
          const SizedBox(height: WiloSpacing.space2),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'easy', label: Text('Facile')),
              ButtonSegment(value: 'medium', label: Text('Moyen')),
              ButtonSegment(value: 'hard', label: Text('Difficile')),
            ],
            selected: {difficulty},
            onSelectionChanged: (sel) => onDifficultyChanged(sel.first),
            style: ButtonStyle(
              backgroundColor: WidgetStateProperty.resolveWith((states) {
                if (states.contains(WidgetState.selected)) {
                  return WiloColors.blue500;
                }
                return WiloColors.bgSecondary;
              }),
              foregroundColor: WidgetStateProperty.all(Colors.white),
            ),
          ),
          const SizedBox(height: WiloSpacing.space6),

          // Nombre de questions
          _SectionTitle('Nombre de questions'),
          const SizedBox(height: WiloSpacing.space2),
          Slider(
            value: questionCount.toDouble(),
            min: 5,
            max: 20,
            divisions: 3,
            label: '$questionCount',
            activeColor: WiloColors.blue500,
            onChanged: (v) => onCountChanged(v.toInt()),
          ),
          Center(
            child: Text(
              '$questionCount questions',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          const SizedBox(height: WiloSpacing.space8),

          // Bouton Lancer
          SizedBox(
            height: 56,
            child: ElevatedButton(
              onPressed: onStart,
              style: ElevatedButton.styleFrom(
                backgroundColor: WiloColors.gold500,
                foregroundColor: WiloColors.bgPrimary,
                textStyle: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
              child: const Text('⚡ Lancer le quiz'),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context)
          .textTheme
          .titleMedium
          ?.copyWith(color: WiloColors.blue300, fontWeight: FontWeight.w600),
    );
  }
}