import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:wi_lo_mobile/features/auth/providers/auth_state.dart';
import 'package:wi_lo_mobile/features/auth/providers/auth_provider.dart';
import 'package:wi_lo_mobile/features/auth/data/auth_service.dart';
import 'package:wi_lo_mobile/features/profile/screens/edit_profile_screen.dart';

class MockAuthService extends Mock implements AuthService {}

void main() {
  late MockAuthService mockAuthService;

  setUp(() {
    mockAuthService = MockAuthService();
  });

  ProviderContainer createContainer(AuthState initialState) {
    final container = ProviderContainer(
      overrides: [
        authServiceProvider.overrideWithValue(mockAuthService),
      ],
    );
    container.read(authProvider.notifier).state = initialState;
    return container;
  }

  group('EditProfileScreen', () {
    testWidgets('Affiche formulaire pré-rempli', (tester) async {
      final container = createContainer(
        Authenticated(
          userId: 'user_1',
          email: 'test@wilo.com',
          name: 'Test User',
          profile: {
            'bio': 'Ma bio',
            'favoriteSport': 'Football',
            'favoriteTeam': 'Équipe A',
          },
        ),
      );

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: EditProfileScreen()),
        ),
      );

      await tester.pump();

      expect(find.text('Modifier le profil'), findsOneWidget);
      expect(find.text('Sauvegarder'), findsOneWidget);

      // Vérifie que le nom est pré-rempli
      expect(find.text('Test User'), findsOneWidget);
    });

    testWidgets('Affiche message si non authentifié', (tester) async {
      final container = createContainer(const Unauthenticated());

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: EditProfileScreen()),
        ),
      );

      await tester.pump();

      expect(find.text('Vous devez être connecté.'), findsOneWidget);
    });
  });
}