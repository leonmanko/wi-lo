import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/providers/auth_state.dart';
import '../../../core/tokens/app_colors.dart';

/// Écran de profil utilisateur.
///
/// États d'écran couverts :
/// - Chargement (indicateur de progression)
/// - Erreur (message + bouton réessayer)
/// - Données partielles (certains champs manquants)
/// - Données complètes (profil affiché normalement)
/// - Non authentifié (redirection vers login)
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    // Rafraîchir le profil à l'ouverture si déjà authentifié
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = ref.read(authProvider);
      if (state is Authenticated) {
        _refreshProfile();
      }
    });
  }

  Future<void> _refreshProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ref.read(authProvider.notifier).checkSession();
      if (mounted) {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Impossible de charger le profil.';
        });
      }
    }
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.backgroundSecondary,
        title: const Text(
          'Déconnexion',
          style: TextStyle(color: AppColors.textPrimary),
        ),
        content: const Text(
          'Voulez-vous vraiment vous déconnecter ?',
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
              'Déconnecter',
              style: TextStyle(color: AppColors.accentError),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await ref.read(authProvider.notifier).logout();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      appBar: AppBar(
        title: const Text('Profil'),
        backgroundColor: AppColors.backgroundPrimary,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        actions: [
          // Bouton rafraîchir
          IconButton(
            onPressed: _isLoading ? null : _refreshProfile,
            icon: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.accentPrimary,
                    ),
                  )
                : const Icon(Icons.refresh, color: AppColors.textSecondary),
            tooltip: 'Actualiser',
          ),
          // Bouton paramètres
          IconButton(
            onPressed: () {
              // TODO: Naviguer vers les paramètres
            },
            icon: const Icon(Icons.settings_outlined,
                color: AppColors.textSecondary),
            tooltip: 'Paramètres',
          ),
        ],
      ),
      body: _buildBody(authState),
    );
  }

  Widget _buildBody(AuthState state) {
    // État : chargement initial
    if (state is AuthInitial || state is AuthLoading && !_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.accentPrimary),
      );
    }

    // État : erreur
    if (_errorMessage != null && state is! Authenticated) {
      return _buildErrorState();
    }

    // État : non authentifié
    if (state is Unauthenticated || state is AuthError) {
      return _buildUnauthenticatedState(state);
    }

    // État : authentifié (données complètes ou partielles)
    if (state is Authenticated) {
      return _buildAuthenticatedProfile(state);
    }

    // Fallback (ne devrait jamais arriver)
    return const Center(
      child: Text(
        'État inconnu',
        style: TextStyle(color: AppColors.textTertiary),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // État : Erreur de chargement
  // ---------------------------------------------------------------------------
  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.cloud_off,
              size: 64,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              _errorMessage ?? 'Erreur inconnue.',
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _refreshProfile,
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Réessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentPrimary,
                foregroundColor: AppColors.backgroundPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // État : Non authentifié
  // ---------------------------------------------------------------------------
  Widget _buildUnauthenticatedState(AuthState state) {
    final message = state is AuthError
        ? state.message
        : 'Connectez-vous pour voir votre profil.';

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.person_off,
              size: 64,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).pushReplacementNamed('/login');
              },
              icon: const Icon(Icons.login, size: 18),
              label: const Text('Se connecter'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentPrimary,
                foregroundColor: AppColors.backgroundPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // État : Profil authentifié
  // ---------------------------------------------------------------------------
  Widget _buildAuthenticatedProfile(Authenticated state) {
    return RefreshIndicator(
      onRefresh: _refreshProfile,
      color: AppColors.accentPrimary,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: Column(
            children: [
              // --- Avatar ---
              _buildAvatar(state),
              const SizedBox(height: 24),

              // --- Identité ---
              _buildIdentitySection(state),
              const SizedBox(height: 32),

              // --- Statistiques ---
              _buildStatsSection(state),
              const SizedBox(height: 32),

              // --- Badge MFA ---
              if (state.role != null) _buildRoleBadge(state.role!),
              const SizedBox(height: 24),

              // --- Actions ---
              _buildActionButtons(),
              const SizedBox(height: 16),

              // --- Bouton déconnexion ---
              _buildLogoutButton(),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Avatar
  // ---------------------------------------------------------------------------
  Widget _buildAvatar(Authenticated state) {
    final avatarUrl = state.profile?['avatar_url'] as String?;
    final initials = state.name.isNotEmpty
        ? state.name
            .split(' ')
            .map((e) => e.isNotEmpty ? e[0].toUpperCase() : '')
            .take(2)
            .join()
        : '?';

    return GestureDetector(
      onTap: () {
        // TODO: Sprint 3 — Upload avatar
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Modification de l\'avatar bientôt disponible.'),
            backgroundColor: AppColors.backgroundSecondary,
          ),
        );
      },
      child: Stack(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: AppColors.accentPrimary.withAlpha(40),
            backgroundImage:
                avatarUrl != null && avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
            child: avatarUrl == null || avatarUrl.isEmpty
                ? Text(
                    initials,
                    style: const TextStyle(
                      color: AppColors.accentPrimary,
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                    ),
                  )
                : null,
          ),
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: AppColors.accentPrimary,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.camera_alt,
                size: 16,
                color: AppColors.backgroundPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Identité
  // ---------------------------------------------------------------------------
  Widget _buildIdentitySection(Authenticated state) {
    return Column(
      children: [
        Text(
          state.name.isNotEmpty ? state.name : 'Sans nom',
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 24,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          state.email.isNotEmpty ? state.email : 'Email non renseigné',
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 14,
          ),
        ),
        if (state.birthDate != null && state.birthDate!.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(
            'Né(e) le ${_formatDate(state.birthDate!)}',
            style: const TextStyle(
              color: AppColors.textTertiary,
              fontSize: 13,
            ),
          ),
        ],
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Statistiques (partielles — seront enrichies au Sprint 11)
  // ---------------------------------------------------------------------------
  Widget _buildStatsSection(Authenticated state) {
    final xp = state.profile?['xp'] as int? ?? 0;
    final level = state.profile?['level'] as int? ?? 1;
    final coins = state.profile?['total_coins'] as int? ?? 0;
    final diamonds = state.profile?['total_diamonds'] as int? ?? 0;
    final favoriteSport = state.profile?['favoriteSport'] as String?;

    // Statistiques compétitives (Sprint 11)
    final totalWins = state.profile?['total_wins'] as int? ?? 0;
    final totalLosses = state.profile?['total_losses'] as int? ?? 0;
    final totalMatches = totalWins + totalLosses;
    final winRate = totalMatches > 0
        ? (totalWins / totalMatches * 100).toStringAsFixed(1)
        : null;
    final longestStreak = state.profile?['longest_streak'] as int? ?? 0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.backgroundSecondary,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Titre section
          const Text(
            'Statistiques',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),

          // Niveau et progression
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _StatItem(
                icon: Icons.bolt,
                label: 'Niveau',
                value: '$level',
                color: AppColors.accentPrimary,
              ),
              _StatItem(
                icon: Icons.star,
                label: 'XP',
                value: _formatNumber(xp),
                color: AppColors.accentWarning,
              ),
              _StatItem(
                icon: Icons.monetization_on_outlined,
                label: 'Coins',
                value: _formatNumber(coins),
                color: AppColors.rarityGold,
              ),
              _StatItem(
                icon: Icons.diamond_outlined,
                label: 'Diamonds',
                value: _formatNumber(diamonds),
                color: AppColors.accentPrimary,
              ),
            ],
          ),

          // Barre de progression XP
          if (xp > 0) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: (xp % 1000) / 1000,
                backgroundColor: AppColors.textTertiary.withAlpha(40),
                valueColor: const AlwaysStoppedAnimation<Color>(
                  AppColors.accentPrimary,
                ),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${xp % 1000} / 1000 XP pour le niveau ${level + 1}',
              style: const TextStyle(
                color: AppColors.textTertiary,
                fontSize: 11,
              ),
            ),
          ],

          const SizedBox(height: 16),
          const Divider(color: AppColors.textTertiary, height: 1),
          const SizedBox(height: 16),

          // Statistiques compétitives
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _StatItem(
                icon: Icons.emoji_events,
                label: 'Victoires',
                value: _formatNumber(totalWins),
                color: AppColors.accentSuccess,
              ),
              _StatItem(
                icon: Icons.cancel_outlined,
                label: 'Défaites',
                value: _formatNumber(totalLosses),
                color: AppColors.accentError,
              ),
              _StatItem(
                icon: Icons.trending_up,
                label: 'Ratio',
                value: winRate != null ? '$winRate%' : '-',
                color: AppColors.accentPrimary,
              ),
              _StatItem(
                icon: Icons.local_fire_department,
                label: 'Série max',
                value: '$longestStreak',
                color: AppColors.accentWarning,
              ),
            ],
          ),

          // Sport favori
          if (favoriteSport != null && favoriteSport.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Divider(color: AppColors.textTertiary, height: 1),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(
                  Icons.favorite,
                  color: AppColors.accentError,
                  size: 16,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Sport favori : ',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                ),
                Text(
                  favoriteSport,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Badge rôle
  // ---------------------------------------------------------------------------
  Widget _buildRoleBadge(String role) {
    Color badgeColor;
    String badgeLabel;

    switch (role) {
      case 'admin':
        badgeColor = AppColors.accentError;
        badgeLabel = 'Admin';
        break;
      case 'moderator':
        badgeColor = AppColors.accentWarning;
        badgeLabel = 'Modérateur';
        break;
      default:
        badgeColor = AppColors.accentPrimary;
        badgeLabel = role;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: badgeColor.withAlpha(25),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: badgeColor.withAlpha(76)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.verified, color: badgeColor, size: 18),
          const SizedBox(width: 8),
          Text(
            badgeLabel,
            style: TextStyle(
              color: badgeColor,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Boutons d'action
  // ---------------------------------------------------------------------------
  Widget _buildActionButtons() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Modifier le profil
        OutlinedButton.icon(
          onPressed: () async {
            final result = await Navigator.of(context).pushNamed('/profile/edit');
            if (result == true) {
              // Rafraîchir le profil si modifications
              _refreshProfile();
            }
          },
          icon: const Icon(Icons.edit_outlined, size: 18),
          label: const Text('Modifier le profil'),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.textPrimary,
            side: const BorderSide(color: AppColors.textTertiary),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Sécurité (MFA)
        OutlinedButton.icon(
          onPressed: () {
            Navigator.of(context).pushNamed('/mfa');
          },
          icon: const Icon(Icons.security_outlined, size: 18),
          label: const Text('Sécurité (MFA)'),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.textPrimary,
            side: const BorderSide(color: AppColors.textTertiary),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Bouton déconnexion
  // ---------------------------------------------------------------------------
  Widget _buildLogoutButton() {
    return OutlinedButton.icon(
      onPressed: _handleLogout,
      icon: const Icon(Icons.logout, size: 18),
      label: const Text('Se déconnecter'),
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.accentError,
        side: const BorderSide(color: AppColors.accentError),
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Utilitaires
  // ---------------------------------------------------------------------------

  String _formatDate(String yyyyMmDd) {
    try {
      final parts = yyyyMmDd.split('-');
      if (parts.length != 3) return yyyyMmDd;
      return '${parts[2]}/${parts[1]}/${parts[0]}';
    } catch (_) {
      return yyyyMmDd;
    }
  }

  String _formatNumber(int number) {
    if (number >= 1000000) {
      return '${(number / 1000000).toStringAsFixed(1)}M';
    }
    if (number >= 1000) {
      return '${(number / 1000).toStringAsFixed(1)}k';
    }
    return number.toString();
  }
}

// ---------------------------------------------------------------------------
// Widget statistique individuelle
// ---------------------------------------------------------------------------
class _StatItem extends StatelessWidget {
  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textTertiary,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}