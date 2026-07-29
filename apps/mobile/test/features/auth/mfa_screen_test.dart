import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:wi_lo_mobile/features/auth/screens/mfa_screen.dart';

void main() {
  group('MfaScreen', () {
    testWidgets('Affiche l\'écran MFA non activée', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: MfaScreen()));
      await tester.pump();

      expect(find.text('Sécurisez votre compte'), findsOneWidget);
      expect(find.text('Activer la MFA'), findsOneWidget);
      expect(find.text('Application d\'authentification'), findsOneWidget);
      expect(find.text('Codes de secours'), findsOneWidget);
      expect(find.text('Protection renforcée'), findsOneWidget);
    });
  });
}