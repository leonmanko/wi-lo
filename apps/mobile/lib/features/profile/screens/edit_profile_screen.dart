import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/providers/auth_state.dart';
import '../../../core/tokens/app_colors.dart';

/// Écran de modification du profil utilisateur.
///
/// États d'écran couverts :
/// - Initial (champs pré-remplis avec les données actuelles)
/// - Modifié (bouton sauvegarder activé)
/// - Chargement (sauvegarde en cours, champs désactivés)
/// - Erreur (message d'erreur)
/// - Succès (retour à l'écran profil avec données mises à jour)
class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _bioController;

  String? _favoriteSport;
  String? _favoriteTeam;
  bool _isLoading = false;
  String? _errorMessage;
  bool _hasChanges = false;

  // Sports disponibles (placeholder — viendra du backend au Sprint 5)
  static const _sports = [
    'Football',
    'Basketball',
    'Tennis',
    'Rugby',
    'Handball',
    'Volleyball',
    'Formule 1',
    'Cyclisme',
    'Natation',
    'Athlétisme',
  ];

  @override
  void initState() {
    super.initState();
    final state = ref.read(authProvider);

    if (state is Authenticated) {
      _nameController = TextEditingController(text: state.name);
      _bioController =
          TextEditingController(text: state.profile?['bio'] as String? ?? '');
      _favoriteSport = state.profile?['favoriteSport'] as String?;
      _favoriteTeam = state.profile?['favoriteTeam'] as String?;
    } else {
      _nameController = TextEditingController();
      _bioController = TextEditingController();
    }

    _nameController.addListener(_onFieldChanged);
    _bioController.addListener(_onFieldChanged);
  }

  @override
  void dispose() {
    _nameController.removeListener(_onFieldChanged);
    _bioController.removeListener(_onFieldChanged);
    _nameController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  void _onFieldChanged() {
    final state = ref.read(authProvider);
    if (state is! Authenticated) return;

    final hasNameChange = _nameController.text.trim() != state.name;
    final hasBioChange =
        _bioController.text.trim() != (state.profile?['bio'] as String? ?? '');
    final hasSportChange = _favoriteSport != state.profile?['favoriteSport'];
    final hasTeamChange = _favoriteTeam != state.profile?['favoriteTeam'];

    final changed = hasNameChange || hasBioChange || hasSportChange || hasTeamChange;

    if (changed != _hasChanges) {
      setState(() => _hasChanges = changed);
    }
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // TODO: Sprint 3 — Appeler user.updateProfile quand le backend sera prêt
      await Future.delayed(const Duration(seconds: 1));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profil mis à jour avec succès.'),
            backgroundColor: AppColors.accentSuccess,
          ),
        );
        Navigator.of(context).pop(true); // true = modifications effectuées
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Erreur lors de la sauvegarde. Réessayez.';
        });
      }
    }
  }

  Future<bool> _onWillPop() async {
    if (!_hasChanges) return true;

    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.backgroundSecondary,
        title: const Text(
          'Modifications non sauvegardées',
          style: TextStyle(color: AppColors.textPrimary),
        ),
        content: const Text(
          'Voulez-vous quitter sans sauvegarder ?',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text(
              'Rester',
              style: TextStyle(color: AppColors.accentPrimary),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text(
              'Quitter',
              style: TextStyle(color: AppColors.accentError),
            ),
          ),
        ],
      ),
    );

    return result ?? false;
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    if (authState is! Authenticated) {
      return Scaffold(
        backgroundColor: AppColors.backgroundPrimary,
        body: const Center(
          child: Text(
            'Vous devez être connecté.',
            style: TextStyle(color: AppColors.textSecondary),
          ),
        ),
      );
    }

    return PopScope(
      canPop: !_hasChanges,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _onWillPop();
        if (shouldPop && mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.backgroundPrimary,
        appBar: AppBar(
          title: const Text('Modifier le profil'),
          backgroundColor: AppColors.backgroundPrimary,
          foregroundColor: AppColors.textPrimary,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: _isLoading
                ? null
                : () async {
                    final shouldPop = await _onWillPop();
                    if (shouldPop && mounted) {
                      Navigator.of(context).pop();
                    }
                  },
          ),
          actions: [
            TextButton(
              onPressed: (_isLoading || !_hasChanges) ? null : _handleSave,
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.accentPrimary,
                      ),
                    )
                  : const Text(
                      'Sauvegarder',
                      style: TextStyle(
                        color: AppColors.accentPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Erreur
                  if (_errorMessage != null) ...[
                    _ErrorBanner(message: _errorMessage!),
                    const SizedBox(height: 16),
                  ],

                  // Nom
                  TextFormField(
                    controller: _nameController,
                    textInputAction: TextInputAction.next,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(
                      labelText: 'Nom',
                      hintText: 'Votre pseudo',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                    style: const TextStyle(color: AppColors.textPrimary),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Le nom est requis.';
                      }
                      if (value.trim().length < 2) {
                        return 'Minimum 2 caractères.';
                      }
                      if (value.trim().length > 50) {
                        return 'Maximum 50 caractères.';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Bio
                  TextFormField(
                    controller: _bioController,
                    textInputAction: TextInputAction.newline,
                    textCapitalization: TextCapitalization.sentences,
                    maxLines: 3,
                    maxLength: 200,
                    decoration: const InputDecoration(
                      labelText: 'Bio',
                      hintText: 'Parlez-nous de vous...',
                      prefixIcon: Icon(Icons.info_outline),
                      counterStyle: TextStyle(color: AppColors.textTertiary),
                    ),
                    style: const TextStyle(color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 24),

                  // Sport favori
                  const Text(
                    'Sport favori',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _favoriteSport,
                    isExpanded: true,
                    dropdownColor: AppColors.backgroundSecondary,
                    icon: const Icon(
                      Icons.keyboard_arrow_down,
                      color: AppColors.textSecondary,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Sélectionnez un sport',
                      prefixIcon: const Icon(Icons.sports_soccer),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.textTertiary),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: AppColors.textTertiary.withAlpha(76),
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                          color: AppColors.accentPrimary,
                          width: 2,
                        ),
                      ),
                    ),
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                    ),
                    items: [
                      const DropdownMenuItem<String>(
                        value: null,
                        child: Text(
                          'Aucun',
                          style: TextStyle(color: AppColors.textTertiary),
                        ),
                      ),
                      ..._sports.map(
                        (sport) => DropdownMenuItem<String>(
                          value: sport,
                          child: Text(sport),
                        ),
                      ),
                    ],
                    onChanged: _isLoading
                        ? null
                        : (value) {
                            setState(() => _favoriteSport = value);
                            _onFieldChanged();
                          },
                  ),
                  const SizedBox(height: 16),

                  // Équipe favorite
                  TextFormField(
                    initialValue: _favoriteTeam ?? '',
                    textInputAction: TextInputAction.done,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(
                      labelText: 'Équipe favorite',
                      hintText: 'Nom de votre équipe',
                      prefixIcon: Icon(Icons.shield_outlined),
                    ),
                    style: const TextStyle(color: AppColors.textPrimary),
                    onChanged: (value) {
                      _favoriteTeam = value.trim().isEmpty ? null : value.trim();
                      _onFieldChanged();
                    },
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Utilisé pour les Derby Days et la Fierté Nationale (Palier 3).',
                    style: TextStyle(
                      color: AppColors.textTertiary,
                      fontSize: 11,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Bouton sauvegarder (mobile)
                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: (_isLoading || !_hasChanges)
                          ? null
                          : _handleSave,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentPrimary,
                        foregroundColor: AppColors.backgroundPrimary,
                        disabledBackgroundColor:
                            AppColors.accentPrimary.withAlpha(76),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                color: AppColors.backgroundPrimary,
                              ),
                            )
                          : const Text(
                              'Sauvegarder les modifications',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.accentError.withAlpha(25),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.accentError.withAlpha(76)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppColors.accentError, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: AppColors.accentError, fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }
}