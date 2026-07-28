import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/tokens/app_colors.dart';

class MfaScreen extends StatefulWidget {
  const MfaScreen({super.key});

  @override
  State<MfaScreen> createState() => _MfaScreenState();
}

class _MfaScreenState extends State<MfaScreen> {
  bool _isActivated = false;
  bool _isLoading = false;
  String? _errorMessage;

  // Codes de secours (simulés — viendront du backend)
  List<String>? _backupCodes;

  Future<void> _activateMfa() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // TODO: Appeler authService.enableMfa() quand le backend sera prêt
      await Future.delayed(const Duration(seconds: 1));

      if (mounted) {
        setState(() {
          _isActivated = true;
          _isLoading = false;
          _backupCodes = [
            'XXXX-XXXX-XXXX-XXXX',
            'YYYY-YYYY-YYYY-YYYY',
            'ZZZZ-ZZZZ-ZZZZ-ZZZZ',
          ];
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Erreur lors de l\'activation. Réessayez.';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _disableMfa() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.backgroundSecondary,
        title: const Text(
          'Désactiver la MFA ?',
          style: TextStyle(color: AppColors.textPrimary),
        ),
        content: const Text(
          'Votre compte sera moins sécurisé.',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text(
              'Annuler',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text(
              'Désactiver',
              style: TextStyle(color: AppColors.accentError),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      setState(() {
        _isActivated = false;
        _backupCodes = null;
      });
    }
  }

  void _copyCodes() {
    if (_backupCodes == null) return;
    final text = _backupCodes!.join('\n');
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Codes copiés dans le presse-papier.'),
        backgroundColor: AppColors.accentSuccess,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      appBar: AppBar(
        title: const Text('Authentification à deux facteurs'),
        backgroundColor: AppColors.backgroundPrimary,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Icône
                const Icon(
                  Icons.security,
                  size: 56,
                  color: AppColors.accentPrimary,
                ),
                const SizedBox(height: 24),

                // Titre
                Text(
                  _isActivated ? 'MFA activée' : 'Sécurisez votre compte',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 12),

                // Description
                Text(
                  _isActivated
                      ? 'Votre compte est protégé par authentification à deux facteurs.'
                      : 'Ajoutez une couche de sécurité supplémentaire. Même si quelqu\'un obtient votre mot de passe, il ne pourra pas accéder à votre compte.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 32),

                // Erreur
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.accentError.withAlpha(25),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline,
                            color: AppColors.accentError, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(
                                color: AppColors.accentError, fontSize: 14),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // État non activé : explications + bouton
                if (!_isActivated) ...[
                  _InfoCard(
                    icon: Icons.qr_code,
                    title: 'Application d\'authentification',
                    description:
                        'Utilisez Google Authenticator, Authy ou une application compatible pour scanner le QR code.',
                  ),
                  const SizedBox(height: 12),
                  _InfoCard(
                    icon: Icons.key,
                    title: 'Codes de secours',
                    description:
                        'Des codes à usage unique vous seront fournis. Conservez-les dans un endroit sûr.',
                  ),
                  const SizedBox(height: 12),
                  _InfoCard(
                    icon: Icons.shield,
                    title: 'Protection renforcée',
                    description:
                        'La MFA protège votre compte même en cas de fuite de votre mot de passe.',
                  ),
                  const SizedBox(height: 32),

                  SizedBox(
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: _isLoading ? null : _activateMfa,
                      icon: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.backgroundPrimary,
                              ),
                            )
                          : const Icon(Icons.lock_outline, size: 20),
                      label: Text(
                        _isLoading ? 'Activation...' : 'Activer la MFA',
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentPrimary,
                        foregroundColor: AppColors.backgroundPrimary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],

                // État activé : succès + codes + désactiver
                if (_isActivated) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.accentSuccess.withAlpha(25),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.accentSuccess.withAlpha(76),
                      ),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.check_circle,
                            color: AppColors.accentSuccess, size: 24),
                        SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'MFA activée avec succès !',
                            style: TextStyle(
                              color: AppColors.accentSuccess,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Codes de secours
                  if (_backupCodes != null) ...[
                    const Text(
                      'Codes de secours',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Conservez ces codes dans un endroit sûr. Chaque code ne peut être utilisé qu\'une seule fois.',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.backgroundSecondary,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.textTertiary.withAlpha(76),
                        ),
                      ),
                      child: Column(
                        children: [
                          ..._backupCodes!.map(
                            (code) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Text(
                                code,
                                style: const TextStyle(
                                  color: AppColors.accentWarning,
                                  fontSize: 16,
                                  fontFamily: 'monospace',
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 2,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          OutlinedButton.icon(
                            onPressed: _copyCodes,
                            icon: const Icon(Icons.copy, size: 16),
                            label: const Text('Copier les codes'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.accentPrimary,
                              side: const BorderSide(
                                color: AppColors.accentPrimary,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 32),

                  // Désactiver
                  OutlinedButton.icon(
                    onPressed: _disableMfa,
                    icon: const Icon(Icons.lock_open, size: 18),
                    label: const Text('Désactiver la MFA'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.accentError,
                      side: const BorderSide(color: AppColors.accentError),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.icon,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.backgroundSecondary,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.accentPrimary, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}