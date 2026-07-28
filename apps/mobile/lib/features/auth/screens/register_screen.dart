import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/tokens/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/auth_state.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  DateTime? _birthDate;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;

  // Consentements RGPD
  bool _consentPrivacy = false;
  bool _consentAds = false;
  bool _consentCookies = false;
  bool _consentNewsletter = false;
  bool _showConsentErrors = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  bool get _allRequiredConsentsGranted =>
      _consentPrivacy && _consentAds && _consentCookies;

  Future<void> _pickBirthDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _birthDate ?? DateTime(now.year - 25),
      firstDate: DateTime(1900),
      lastDate: DateTime(now.year - 10, now.month, now.day),
      helpText: 'Date de naissance',
      cancelText: 'Annuler',
      confirmText: 'Valider',
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.accentPrimary,
              onPrimary: AppColors.backgroundPrimary,
              surface: AppColors.backgroundSecondary,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && mounted) {
      setState(() => _birthDate = picked);
    }
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    if (_birthDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez sélectionner votre date de naissance.'),
          backgroundColor: AppColors.accentError,
        ),
      );
      return;
    }

    if (!_allRequiredConsentsGranted) {
      setState(() => _showConsentErrors = true);
      return;
    }

    setState(() => _isLoading = true);

    final birthDateString =
        '${_birthDate!.year}-${_birthDate!.month.toString().padLeft(2, '0')}-${_birthDate!.day.toString().padLeft(2, '0')}';

    await ref.read(authProvider.notifier).register(
          email: _emailController.text,
          password: _passwordController.text,
          name: _nameController.text,
          birthDate: birthDateString,
          consents: {
            'privacy_policy': _consentPrivacy,
            'personalized_ads': _consentAds,
            'cookies': _consentCookies,
            'newsletter': _consentNewsletter,
          },
        );

    if (mounted) {
      setState(() => _isLoading = false);

      final state = ref.read(authProvider);
      if (state is Unauthenticated && state.reason == 'registration_success') {
        Navigator.of(context).pushReplacementNamed('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final dateFormat = _birthDate != null
        ? '${_birthDate!.day.toString().padLeft(2, '0')}/${_birthDate!.month.toString().padLeft(2, '0')}/${_birthDate!.year}'
        : null;

    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Titre
                    const Text(
                      'Créer un compte',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 28,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Rejoignez la communauté WI-LO',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Erreur
                    if (authState is AuthError) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.accentError.withAlpha(25),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: AppColors.accentError.withAlpha(76),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline,
                                color: AppColors.accentError, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                authState.message,
                                style: const TextStyle(
                                    color: AppColors.accentError, fontSize: 14),
                              ),
                            ),
                          ],
                        ),
                      ),
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
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Email
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        hintText: 'votre@email.com',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                      style: const TextStyle(color: AppColors.textPrimary),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'L\'email est requis.';
                        }
                        if (!value.contains('@') || !value.contains('.')) {
                          return 'Format d\'email invalide.';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Date de naissance
                    InkWell(
                      onTap: _isLoading ? null : _pickBirthDate,
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 16),
                        decoration: BoxDecoration(
                          color: AppColors.backgroundSecondary,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: AppColors.textTertiary.withAlpha(76),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.calendar_today,
                              color: _birthDate != null
                                  ? AppColors.accentPrimary
                                  : AppColors.textTertiary,
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                dateFormat ??
                                    'Date de naissance (obligatoire)',
                                style: TextStyle(
                                  color: _birthDate != null
                                      ? AppColors.textPrimary
                                      : AppColors.textTertiary,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            if (_birthDate != null)
                              GestureDetector(
                                onTap: () {
                                  setState(() => _birthDate = null);
                                },
                                child: const Icon(
                                  Icons.close,
                                  color: AppColors.textSecondary,
                                  size: 18,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Vous devez avoir au moins 13 ans.',
                      style:
                          TextStyle(color: AppColors.textTertiary, fontSize: 12),
                    ),
                    const SizedBox(height: 16),

                    // Mot de passe
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      textInputAction: TextInputAction.next,
                      decoration: InputDecoration(
                        labelText: 'Mot de passe',
                        hintText: 'Minimum 8 caractères',
                        prefixIcon: const Icon(Icons.lock_outlined),
                        suffixIcon: IconButton(
                          icon: Icon(_obscurePassword
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined),
                          onPressed: () {
                            setState(
                                () => _obscurePassword = !_obscurePassword);
                          },
                        ),
                      ),
                      style: const TextStyle(color: AppColors.textPrimary),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Le mot de passe est requis.';
                        }
                        if (value.length < 8) {
                          return 'Minimum 8 caractères.';
                        }
                        if (!value.contains(RegExp(r'[A-Z]'))) {
                          return 'Au moins une majuscule.';
                        }
                        if (!value.contains(RegExp(r'[a-z]'))) {
                          return 'Au moins une minuscule.';
                        }
                        if (!value.contains(RegExp(r'[0-9]'))) {
                          return 'Au moins un chiffre.';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Confirmation mot de passe
                    TextFormField(
                      controller: _confirmPasswordController,
                      obscureText: _obscureConfirmPassword,
                      textInputAction: TextInputAction.done,
                      decoration: InputDecoration(
                        labelText: 'Confirmer le mot de passe',
                        hintText: 'Répétez votre mot de passe',
                        prefixIcon: const Icon(Icons.lock_outlined),
                        suffixIcon: IconButton(
                          icon: Icon(_obscureConfirmPassword
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined),
                          onPressed: () {
                            setState(() =>
                                _obscureConfirmPassword =
                                    !_obscureConfirmPassword);
                          },
                        ),
                      ),
                      style: const TextStyle(color: AppColors.textPrimary),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Veuillez confirmer votre mot de passe.';
                        }
                        if (value != _passwordController.text) {
                          return 'Les mots de passe ne correspondent pas.';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),

                    // Consentements RGPD
                    const Text(
                      'Consentements requis',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),

                    _ConsentCheckbox(
                      label: 'Politique de confidentialité',
                      required: true,
                      value: _consentPrivacy,
                      hasError: _showConsentErrors && !_consentPrivacy,
                      onChanged: _isLoading
                          ? null
                          : (v) => setState(() => _consentPrivacy = v ?? false),
                    ),
                    _ConsentCheckbox(
                      label: 'Publicité personnalisée',
                      required: true,
                      value: _consentAds,
                      hasError: _showConsentErrors && !_consentAds,
                      onChanged: _isLoading
                          ? null
                          : (v) => setState(() => _consentAds = v ?? false),
                    ),
                    _ConsentCheckbox(
                      label: 'Cookies',
                      required: true,
                      value: _consentCookies,
                      hasError: _showConsentErrors && !_consentCookies,
                      onChanged: _isLoading
                          ? null
                          : (v) => setState(() => _consentCookies = v ?? false),
                    ),
                    _ConsentCheckbox(
                      label: 'Emails marketing (optionnel)',
                      required: false,
                      value: _consentNewsletter,
                      hasError: false,
                      onChanged: _isLoading
                          ? null
                          : (v) =>
                              setState(() => _consentNewsletter = v ?? false),
                    ),

                    if (_showConsentErrors && !_allRequiredConsentsGranted) ...[
                      const SizedBox(height: 4),
                      const Text(
                        'Vous devez accepter les conditions obligatoires.',
                        style: TextStyle(
                            color: AppColors.accentError, fontSize: 12),
                      ),
                    ],
                    const SizedBox(height: 24),

                    // Bouton Inscription
                    SizedBox(
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _handleRegister,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accentPrimary,
                          foregroundColor: AppColors.backgroundPrimary,
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
                                'Créer mon compte',
                                style: TextStyle(
                                    fontSize: 16, fontWeight: FontWeight.w600),
                              ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Lien Connexion
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'Déjà un compte ? ',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                        GestureDetector(
                          onTap: _isLoading
                              ? null
                              : () => Navigator.of(context).pop(),
                          child: const Text(
                            'Se connecter',
                            style: TextStyle(
                              color: AppColors.accentPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// Widget consentement RGPD réutilisable
class _ConsentCheckbox extends StatelessWidget {
  const _ConsentCheckbox({
    required this.label,
    required this.required,
    required this.value,
    required this.hasError,
    this.onChanged,
  });

  final String label;
  final bool required;
  final bool value;
  final bool hasError;
  final void Function(bool?)? onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: 24,
            height: 24,
            child: Checkbox(
              value: value,
              onChanged: onChanged,
              activeColor: AppColors.accentPrimary,
              checkColor: AppColors.backgroundPrimary,
              side: BorderSide(
                color: hasError
                    ? AppColors.accentError
                    : AppColors.textTertiary,
                width: 2,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: const TextStyle(
                    color: AppColors.textPrimary, fontSize: 14),
                children: [
                  TextSpan(text: label),
                  if (required) ...[
                    const TextSpan(text: ' '),
                    TextSpan(
                      text: '(obligatoire)',
                      style: TextStyle(
                        color: AppColors.accentPrimary.withAlpha(179),
                        fontSize: 11,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}