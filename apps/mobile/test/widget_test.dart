import 'package:flutter_test/flutter_test.dart';
import 'package:wi_lo_mobile/app.dart';

void main() {
  testWidgets('App launches', (WidgetTester tester) async {
    await tester.pumpWidget(const WiLoApp());
    expect(find.text('WI-LO'), findsOneWidget);
  });
}
