import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:wi_lo_mobile/features/auth/providers/auth_state.dart';
import 'package:wi_lo_mobile/features/auth/providers/auth_provider.dart';
import 'package:wi_lo_mobile/features/auth/data/auth_service.dart';
import 'package:wi_lo_mobile/features/auth/screens/login_screen.dart';

class MockAuthService extends Mock implements AuthService {}

void main() {
  late MockAuthService mockAuthService;

  setUp(() {
    mockAuthService = MockAuthService();
  });

  ProviderContainer createContainer(AuthState state) {
    final container = ProviderContainer(
      overrides: [
        authServiceProvider.overrideWithValue(mockAuthService),
      ],
    );
    container.read(authProvider.notifier).state = state;
    return container;
  }

  group('LoginScreen', () {
    testWidgets('Affiche le titre et les champs', (tester) async {
      final container = createContainer(const Unauthenticated());

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: LoginScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('WI-LO'), findsOneWidget);
      expect(find.text('Se connecter'), findsOneWidget);
      expect(find.text('S\'inscrire'), findsOneWidget);
    });

    testWidgets('Affiche erreur de connexion', (tester) async {
      final container = createContainer(
        const AuthError(message: 'Email ou mot de passe incorrect.'),
      );

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: LoginScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Email ou mot de passe incorrect.'), findsOneWidget);
    });

    testWidgets('Affiche message inscription réussie', (tester) async {
      final container = createContainer(
        const Unauthenticated(reason: 'registration_success'),
      );

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: LoginScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(
        find.text('Compte créé avec succès ! Connectez-vous.'),
        findsOneWidget,
      );
    });

    testWidgets('Placeholders OAuth affichés', (tester) async {
      final container = createContainer(const Unauthenticated());

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: LoginScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Ou continuer avec'), findsOneWidget);
      expect(find.text('Google'), findsOneWidget);
      expect(find.text('Apple'), findsOneWidget);
    });
  });
}