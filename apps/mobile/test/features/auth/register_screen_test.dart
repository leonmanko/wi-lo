import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:wi_lo_mobile/features/auth/providers/auth_state.dart';
import 'package:wi_lo_mobile/features/auth/providers/auth_provider.dart';
import 'package:wi_lo_mobile/features/auth/data/auth_service.dart';
import 'package:wi_lo_mobile/features/auth/screens/register_screen.dart';

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

  group('RegisterScreen', () {
    testWidgets('Affiche le titre et les champs', (tester) async {
      final container = createContainer(const Unauthenticated());

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: RegisterScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Créer un compte'), findsOneWidget);
      expect(find.text('Créer mon compte'), findsOneWidget);
      expect(find.text('Se connecter'), findsOneWidget);
    });

    testWidgets('Affiche les labels des consentements', (tester) async {
      final container = createContainer(const Unauthenticated());

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: RegisterScreen()),
        ),
      );
      await tester.pumpAndSettle();

      // Vérifie que la section consentements est présente
      expect(find.text('Consentements requis'), findsOneWidget);
      // Vérifie les checkboxes (3 obligatoires + 1 optionnel = 4 checkboxes)
      expect(find.byType(Checkbox), findsNWidgets(4));
    });

    testWidgets('Affiche le champ date de naissance', (tester) async {
      final container = createContainer(const Unauthenticated());

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: RegisterScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Date de naissance (obligatoire)'), findsOneWidget);
      expect(find.text('Vous devez avoir au moins 13 ans.'), findsOneWidget);
    });

    testWidgets('Affiche erreur d\'inscription', (tester) async {
      final container = createContainer(
        const AuthError(message: 'Email déjà utilisé.'),
      );

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: RegisterScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Email déjà utilisé.'), findsOneWidget);
    });
  });
}