import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';

import 'package:wi_lo_mobile/core/secure_storage/secure_storage_service.dart';
import 'package:wi_lo_mobile/features/auth/providers/auth_provider.dart';
import 'package:wi_lo_mobile/features/auth/providers/auth_state.dart';
import 'package:wi_lo_mobile/features/auth/data/auth_service.dart';

// --- Mocks ---

class MockSecureStorageService extends Mock implements SecureStorageService {}

class MockAuthService extends Mock implements AuthService {}

// --- Tests ---

void main() {
  late MockSecureStorageService mockStorage;
  late MockAuthService mockAuthService;
  late ProviderContainer container;

  setUp(() {
    mockStorage = MockSecureStorageService();
    mockAuthService = MockAuthService();

    container = ProviderContainer(
      overrides: [
        authServiceProvider.overrideWithValue(mockAuthService),
      ],
    );
  });

  tearDown(() {
    container.dispose();
  });

  group('Flux d\'authentification complet', () {
    // ---------------------------------------------------------------------------
    // 1. Démarrage — vérification session
    // ---------------------------------------------------------------------------
    group('1. Démarrage — checkSession', () {
      test('État initial = AuthInitial', () {
        final state = container.read(authProvider);
        expect(state, isA<AuthInitial>());
      });

      test('Pas de token → Unauthenticated', () async {
        when(() => mockAuthService.isLoggedIn()).thenAnswer((_) async => false);

        await container.read(authProvider.notifier).checkSession();

        final state = container.read(authProvider);
        expect(state, isA<Unauthenticated>());
      });

      test('Token valide → Authenticated', () async {
        when(() => mockAuthService.isLoggedIn()).thenAnswer((_) async => true);
        when(() => mockAuthService.validateSession()).thenAnswer((_) async => {
              'id': 'user_1',
              'email': 'test@wilo.com',
              'name': 'Test User',
            });

        await container.read(authProvider.notifier).checkSession();

        final state = container.read(authProvider);
        expect(state, isA<Authenticated>());
        expect((state as Authenticated).email, 'test@wilo.com');
        expect(state.name, 'Test User');
      });

      test('Token expiré → Unauthenticated (session_expired)', () async {
        when(() => mockAuthService.isLoggedIn()).thenAnswer((_) async => true);
        when(() => mockAuthService.validateSession())
            .thenThrow(Exception('Session expirée'));
        when(() => mockAuthService.logout()).thenAnswer((_) async {});

        await container.read(authProvider.notifier).checkSession();

        final state = container.read(authProvider);
        expect(state, isA<Unauthenticated>());
        expect((state as Unauthenticated).reason, 'session_expired');
      });
    });

    // ---------------------------------------------------------------------------
    // 2. Connexion
    // ---------------------------------------------------------------------------
    group('2. Connexion — login', () {
      test('Login réussi → Authenticated', () async {
        when(() => mockAuthService.loginWithEmail(
              email: 'test@wilo.com',
              password: 'Password1',
              deviceFingerprint: any(named: 'deviceFingerprint'),
              ipAddress: any(named: 'ipAddress'),
            )).thenAnswer((_) async => {
              'id': 'user_1',
              'email': 'test@wilo.com',
              'name': 'Test User',
            });
        when(() => mockAuthService.getLocalUserId())
            .thenAnswer((_) async => 'user_1');

        await container.read(authProvider.notifier).login(
              email: 'test@wilo.com',
              password: 'Password1',
            );

        final state = container.read(authProvider);
        expect(state, isA<Authenticated>());
        expect((state as Authenticated).email, 'test@wilo.com');
      });

      test('Login échoué → AuthError', () async {
        when(() => mockAuthService.loginWithEmail(
              email: any(named: 'email'),
              password: any(named: 'password'),
              deviceFingerprint: any(named: 'deviceFingerprint'),
              ipAddress: any(named: 'ipAddress'),
            )).thenThrow(Exception('Email ou mot de passe incorrect.'));

        await container.read(authProvider.notifier).login(
              email: 'wrong@wilo.com',
              password: 'WrongPass1',
            );

        final state = container.read(authProvider);
        expect(state, isA<AuthError>());
        expect(
          (state as AuthError).message,
          contains('Email ou mot de passe incorrect'),
        );
      });
    });

    // ---------------------------------------------------------------------------
    // 3. Inscription
    // ---------------------------------------------------------------------------
    group('3. Inscription — register', () {
      test('Inscription réussie → Unauthenticated (registration_success)',
          () async {
        when(() => mockAuthService.register(
              email: 'new@wilo.com',
              password: 'Password1',
              name: 'New User',
              birthDate: '2000-01-01',
              consents: {
                'privacy_policy': true,
                'personalized_ads': true,
                'cookies': true,
                'newsletter': false,
              },
            )).thenAnswer((_) async => {'id': 'user_2', 'email': 'new@wilo.com'});

        await container.read(authProvider.notifier).register(
              email: 'new@wilo.com',
              password: 'Password1',
              name: 'New User',
              birthDate: '2000-01-01',
              consents: {
                'privacy_policy': true,
                'personalized_ads': true,
                'cookies': true,
                'newsletter': false,
              },
            );

        final state = container.read(authProvider);
        expect(state, isA<Unauthenticated>());
        expect((state as Unauthenticated).reason, 'registration_success');
      });

      test('Inscription échouée → AuthError', () async {
        when(() => mockAuthService.register(
              email: any(named: 'email'),
              password: any(named: 'password'),
              name: any(named: 'name'),
              birthDate: any(named: 'birthDate'),
              consents: any(named: 'consents'),
            )).thenThrow(Exception('Email déjà utilisé.'));

        await container.read(authProvider.notifier).register(
              email: 'used@wilo.com',
              password: 'Password1',
              name: 'Used',
              birthDate: '2000-01-01',
              consents: {
                'privacy_policy': true,
                'personalized_ads': true,
                'cookies': true,
                'newsletter': false,
              },
            );

        final state = container.read(authProvider);
        expect(state, isA<AuthError>());
        expect(
          (state as AuthError).message,
          contains('Email déjà utilisé'),
        );
      });
    });

    // ---------------------------------------------------------------------------
    // 4. Déconnexion
    // ---------------------------------------------------------------------------
    group('4. Déconnexion — logout', () {
      test('Logout → Unauthenticated', () async {
        when(() => mockAuthService.logout()).thenAnswer((_) async {});

        await container.read(authProvider.notifier).logout();

        final state = container.read(authProvider);
        expect(state, isA<Unauthenticated>());
      });

      test('Logout échoué → Unauthenticated quand même', () async {
        when(() => mockAuthService.logout())
            .thenThrow(Exception('Erreur réseau'));

        await container.read(authProvider.notifier).logout();

        final state = container.read(authProvider);
        expect(state, isA<Unauthenticated>());
      });
    });

    // ---------------------------------------------------------------------------
    // 5. Flux complet (intégration)
    // ---------------------------------------------------------------------------
    group('5. Flux complet', () {
      test('Démarrage → Login → Logout', () async {
        // Démarrage : pas de token
        when(() => mockAuthService.isLoggedIn()).thenAnswer((_) async => false);
        await container.read(authProvider.notifier).checkSession();
        expect(container.read(authProvider), isA<Unauthenticated>());

        // Login
        when(() => mockAuthService.loginWithEmail(
              email: 'test@wilo.com',
              password: 'Password1',
              deviceFingerprint: any(named: 'deviceFingerprint'),
              ipAddress: any(named: 'ipAddress'),
            )).thenAnswer((_) async => {
              'id': 'user_1',
              'email': 'test@wilo.com',
              'name': 'Test User',
            });
        when(() => mockAuthService.getLocalUserId())
            .thenAnswer((_) async => 'user_1');

        await container.read(authProvider.notifier).login(
              email: 'test@wilo.com',
              password: 'Password1',
            );
        expect(container.read(authProvider), isA<Authenticated>());

        // Logout
        when(() => mockAuthService.logout()).thenAnswer((_) async {});
        await container.read(authProvider.notifier).logout();
        expect(container.read(authProvider), isA<Unauthenticated>());
      });

      test('Démarrage → Session valide → Logout', () async {
        // Démarrage : token trouvé
        when(() => mockAuthService.isLoggedIn()).thenAnswer((_) async => true);
        when(() => mockAuthService.validateSession()).thenAnswer((_) async => {
              'id': 'user_1',
              'email': 'test@wilo.com',
              'name': 'Test User',
            });

        await container.read(authProvider.notifier).checkSession();
        expect(container.read(authProvider), isA<Authenticated>());

        // Logout
        when(() => mockAuthService.logout()).thenAnswer((_) async {});
        await container.read(authProvider.notifier).logout();
        expect(container.read(authProvider), isA<Unauthenticated>());
      });

      test('Démarrage → Session expirée → Login → Logout', () async {
        // Session expirée
        when(() => mockAuthService.isLoggedIn()).thenAnswer((_) async => true);
        when(() => mockAuthService.validateSession())
            .thenThrow(Exception('Session expirée'));
        when(() => mockAuthService.logout()).thenAnswer((_) async {});

        await container.read(authProvider.notifier).checkSession();
        expect(container.read(authProvider), isA<Unauthenticated>());
        expect(
          (container.read(authProvider) as Unauthenticated).reason,
          'session_expired',
        );

        // Login
        when(() => mockAuthService.loginWithEmail(
              email: 'test@wilo.com',
              password: 'Password1',
              deviceFingerprint: any(named: 'deviceFingerprint'),
              ipAddress: any(named: 'ipAddress'),
            )).thenAnswer((_) async => {
              'id': 'user_1',
              'email': 'test@wilo.com',
              'name': 'Test User',
            });
        when(() => mockAuthService.getLocalUserId())
            .thenAnswer((_) async => 'user_1');

        await container.read(authProvider.notifier).login(
              email: 'test@wilo.com',
              password: 'Password1',
            );
        expect(container.read(authProvider), isA<Authenticated>());

        // Logout final
        when(() => mockAuthService.logout()).thenAnswer((_) async {});
        await container.read(authProvider.notifier).logout();
        expect(container.read(authProvider), isA<Unauthenticated>());
      });
    });
  });
}