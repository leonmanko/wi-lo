import 'package:flutter/material.dart';
import 'features/auth/screens/mfa_screen.dart';

class WiLoApp extends StatelessWidget {
  const WiLoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WI-LO',
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/mfa':
            return MaterialPageRoute(
              builder: (_) => const MfaScreen(),
              settings: settings,
            );
          default:
            return null;
        }
      },
      home: const _SplashScreen(),
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF0A0E21),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.sports_esports,
              size: 64,
              color: Color(0xFF00E5FF),
            ),
            SizedBox(height: 24),
            Text(
              'WI-LO',
              style: TextStyle(
                color: Color(0xFF00E5FF),
                fontSize: 32,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
              ),
            ),
            SizedBox(height: 24),
            SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: Color(0xFF00E5FF),
              ),
            ),
          ],
        ),
      ),
    );
  }
}