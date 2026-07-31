import 'package:flutter/material.dart';
import '../../../theme/wilo_theme.dart';

/// ONB1 — Logo WI-LO animé (2.5 secondes, auto-advance).
class OnboardingStepLogo extends StatefulWidget {
  const OnboardingStepLogo({super.key});

  @override
  State<OnboardingStepLogo> createState() => _OnboardingStepLogoState();
}

class _OnboardingStepLogoState extends State<OnboardingStepLogo>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _scaleAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOutBack),
      ),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.2, 1.0, curve: Curves.easeOut),
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Opacity(
            opacity: _opacityAnimation.value,
            child: Transform.scale(
              scale: _scaleAnimation.value,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Icône
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [WiloColors.blue500, WiloColors.blue700],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: WiloColors.blue500.withAlpha(60),
                          blurRadius: 40,
                          spreadRadius: 8,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.sports_esports,
                      size: 48,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: WiloSpacing.space6),
                  // Titre
                  Text(
                    'WI-LO',
                    style: Theme.of(context).textTheme.displayLarge,
                  ),
                  const SizedBox(height: WiloSpacing.space2),
                  Text(
                    'Le quiz sportif du futur',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}