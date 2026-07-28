import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/auth_service.dart';
import 'auth_state.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );
  final service = AuthService(baseUrl: baseUrl);
  ref.onDispose(() => service.dispose());
  return service;
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService: authService);
});

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier({required this.authService}) : super(const AuthInitial());

  final AuthService authService;

  Future<void> checkSession() async {
    if (state is Authenticated || state is AuthLoading) return;

    final isLoggedIn = await authService.isLoggedIn();
    if (!isLoggedIn) {
      state = const Unauthenticated();
      return;
    }

    state = const AuthLoading();

    try {
      final userData = await authService.validateSession();
      final userId = userData['id'] as String? ??
          userData['userId'] as String? ??
          (await authService.getLocalUserId()) ??
          '';

      state = Authenticated(
        userId: userId,
        email: userData['email'] as String? ?? '',
        name: userData['name'] as String? ?? '',
        role: userData['role'] as String?,
        birthDate: userData['birthDate'] as String?,
        profile: userData['profile'] as Map<String, dynamic>?,
      );
    } on Exception {
      await authService.logout();
      state = const Unauthenticated(reason: 'session_expired');
    }
  }

  Future<void> login({
    required String email,
    required String password,
    String? deviceFingerprint,
    String? ipAddress,
  }) async {
    state = const AuthLoading();

    try {
      final userData = await authService.loginWithEmail(
        email: email,
        password: password,
        deviceFingerprint: deviceFingerprint,
        ipAddress: ipAddress,
      );

      state = Authenticated(
        userId: userData['id'] as String? ??
            userData['userId'] as String? ??
            (await authService.getLocalUserId()) ??
            '',
        email: userData['email'] as String? ?? email,
        name: userData['name'] as String? ?? '',
        role: userData['role'] as String?,
        birthDate: userData['birthDate'] as String?,
        profile: userData['profile'] as Map<String, dynamic>?,
      );
    } on Exception catch (e) {
      state = AuthError(message: e.toString().replaceFirst('Exception: ', ''));
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String name,
    required String birthDate,
    required Map<String, bool> consents,
  }) async {
    state = const AuthLoading();

    try {
      await authService.register(
        email: email,
        password: password,
        name: name,
        birthDate: birthDate,
        consents: consents,
      );
      state = const Unauthenticated(reason: 'registration_success');
    } on Exception catch (e) {
      state = AuthError(message: e.toString().replaceFirst('Exception: ', ''));
    }
  }

  Future<void> logout() async {
    try {
      await authService.logout();
    } catch (_) {} finally {
      state = const Unauthenticated();
    }
  }
}