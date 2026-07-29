import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:wi_lo_mobile/features/auth/providers/auth_state.dart';
import 'package:wi_lo_mobile/features/auth/providers/auth_provider.dart';
import 'package:wi_lo_mobile/features/auth/data/auth_service.dart';
import 'package:wi_lo_mobile/features/profile/screens/profile_screen.dart';

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

  group('ProfileScreen', () {
    testWidgets('Affiche nom, email et stats de base', (tester) async {
      final container = createContainer(
        Authenticated(
          userId: 'user_1',
          email: 'test@wilo.com',
          name: 'Test User',
          profile: {
            'level': 15,
            'xp': 7500,
            'total_coins': 12500,
            'total_diamonds': 340,
            'total_wins': 48,
            'total_losses': 12,
            'longest_streak': 7,
            'favoriteSport': 'Football',
          },
        ),
      );

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: ProfileScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Test User'), findsOneWidget);
      expect(find.text('test@wilo.com'), findsOneWidget);
      expect(find.text('7.5k'), findsOneWidget);
      expect(find.text('80.0%'), findsOneWidget);
      expect(find.text('Football'), findsOneWidget);
    });

    testWidgets('Affiche "-" pour ratio sans matchs', (tester) async {
      final container = createContainer(
        Authenticated(
          userId: 'user_2',
          email: 'new@wilo.com',
          name: 'New User',
          profile: {
            'level': 1,
            'xp': 0,
            'total_coins': 0,
            'total_diamonds': 0,
            'total_wins': 0,
            'total_losses': 0,
            'longest_streak': 0,
          },
        ),
      );

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: ProfileScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('-'), findsOneWidget);
    });

    testWidgets('Affiche message non authentifié', (tester) async {
      final container = createContainer(const Unauthenticated());

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: ProfileScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Connectez-vous pour voir votre profil.'), findsOneWidget);
      expect(find.text('Se connecter'), findsOneWidget);
    });

    testWidgets('Bouton déconnexion présent', (tester) async {
      final container = createContainer(
        const Authenticated(
          userId: 'user_1',
          email: 'test@wilo.com',
          name: 'Test',
        ),
      );

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: ProfileScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Se déconnecter'), findsOneWidget);
    });
  });
}