import '../../../core/secure_storage/secure_storage_service.dart';
import 'auth_repository.dart';

/// Service d'authentification — point d'entrée unique pour toute l'application.
///
/// Encapsule AuthRepository et SecureStorageService.
/// Les écrans et providers passent par ce service, jamais par le repository directement.
class AuthService {
  AuthService({
    required this.baseUrl,
    SecureStorageService? secureStorage,
  }) : _secureStorage = secureStorage ?? SecureStorageService();

  final String baseUrl;
  final SecureStorageService _secureStorage;
  AuthRepository? _repository;

  AuthRepository get _repo {
    _repository ??= AuthRepository(
      baseUrl: baseUrl,
      secureStorage: _secureStorage,
    );
    return _repository!;
  }

  // ---------------------------------------------------------------------------
  // Session
  // ---------------------------------------------------------------------------

  /// Vérifie si un token est stocké localement.
  Future<bool> isLoggedIn() => _secureStorage.hasAccessToken();

  /// Vérifie la session côté serveur.
  Future<Map<String, dynamic>> validateSession() => _repo.me();

  /// Récupère l'ID utilisateur stocké localement.
  Future<String?> getLocalUserId() => _secureStorage.getUserId();

  // ---------------------------------------------------------------------------
  // Connexion
  // ---------------------------------------------------------------------------

  /// Connexion par email et mot de passe.
  Future<Map<String, dynamic>> loginWithEmail({
    required String email,
    required String password,
    String? deviceFingerprint,
    String? ipAddress,
  }) {
    return _repo.login(
      email: email,
      password: password,
      deviceFingerprint: deviceFingerprint,
      ipAddress: ipAddress,
    );
  }

  /// Connexion via Google (placeholder — sera activé quand configuré).
  Future<Map<String, dynamic>> loginWithGoogle() async {
    throw UnimplementedError('Google Sign-In sera activé ultérieurement.');
  }

  /// Connexion via Apple (placeholder — sera activé quand configuré).
  Future<Map<String, dynamic>> loginWithApple() async {
    throw UnimplementedError('Apple Sign-In sera activé ultérieurement.');
  }

  // ---------------------------------------------------------------------------
  // Inscription
  // ---------------------------------------------------------------------------

  /// Inscription avec email, mot de passe, date de naissance et consentements.
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String name,
    required String birthDate,
    required Map<String, bool> consents,
  }) {
    return _repo.register(
      email: email,
      password: password,
      name: name,
      birthDate: birthDate,
      consents: consents,
    );
  }

  // ---------------------------------------------------------------------------
  // Déconnexion
  // ---------------------------------------------------------------------------

  /// Déconnecte l'utilisateur (révoque la session + efface le stockage).
  Future<void> logout() => _repo.logout();

  // ---------------------------------------------------------------------------
  // Tokens
  // ---------------------------------------------------------------------------

  /// Récupère le token d'accès stocké.
  Future<String?> getAccessToken() => _secureStorage.getAccessToken();

  /// Récupère le refresh token stocké.
  Future<String?> getRefreshToken() => _secureStorage.getRefreshToken();

  // ---------------------------------------------------------------------------
  // Libération ressources
  // ---------------------------------------------------------------------------

  void dispose() {
    _repository?.dispose();
    _repository = null;
  }
}