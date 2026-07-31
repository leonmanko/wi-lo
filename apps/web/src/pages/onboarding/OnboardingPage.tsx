// apps/web/src/pages/onboarding/OnboardingPage.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import WelcomeStep from './steps/WelcomeStep';
import SportSelectStep from './steps/SportSelectStep';
import TeamSelectStep from './steps/TeamSelectStep';
import TutorialStep from './steps/TutorialStep';
import AnimatedTransition from '../../components/animations/AnimatedTransition';
import { useOnboardingPersistence } from '../../hooks/useOnboardingPersistence';

/**
 * Page d'onboarding cinématique WI-LO.
 * 
 * Flux en 4 étapes :
 * ONB1 (2.5s) : Logo + audio logo → AUTO
 * ONB2 : Choix sport favori (grille 6 sports) → TAP
 * ONB3 : Choix équipe (optionnel, skippable) → TAP
 * ONB4 : Didacticiel 3 slides + Mascotte → TAP "C'est parti !"
 * 
 * États couverts :
 * - Chargement (animation logo)
 * - Chaque étape avec transition
 * - Skip possible sur ONB3
 * - Redirection vers / à la fin
 * - Gestion d'interruption (reprise après fermeture)
 */

type OnboardingStep = 'welcome' | 'sport' | 'team' | 'tutorial';

interface OnboardingData {
  favoriteSport: string | null;
  favoriteTeam: string | null;
}

const TOTAL_STEPS = 4;

export default function OnboardingPage(): React.ReactElement {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [data, setData] = useState<OnboardingData>({
    favoriteSport: user?.profile?.favoriteSport ?? null,
    favoriteTeam: user?.profile?.favoriteTeam ?? null,
  });
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const {
    restoredState,
    isRestored,
    saveProgress,
    clearProgress,
  } = useOnboardingPersistence();

  // ---------------------------------------------------------------------------
  // Progression
  // ---------------------------------------------------------------------------

  const stepIndex: Record<OnboardingStep, number> = {
    welcome: 0,
    sport: 1,
    team: 2,
    tutorial: 3,
  };

  const currentStepIndex = stepIndex[currentStep];

  // ---------------------------------------------------------------------------
  // Restauration d'interruption
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (isRestored && restoredState) {
      // Restaurer les données
      setData({
        favoriteSport: restoredState.favoriteSport ?? null,
        favoriteTeam: restoredState.favoriteTeam ?? null,
      });

      // Reprendre à l'étape appropriée
      if (restoredState.lastCompletedStep === 'sport') {
        setCurrentStep('sport');
      } else if (restoredState.lastCompletedStep === 'team') {
        setCurrentStep('team');
      } else if (restoredState.lastCompletedStep === 'tutorial') {
        setCurrentStep('tutorial');
      }
      // Welcome reste l'étape par défaut
    }
  }, [isRestored, restoredState]);

  // ---------------------------------------------------------------------------
  // Navigation entre étapes
  // ---------------------------------------------------------------------------

  const goToStep = useCallback((step: OnboardingStep) => {
    setDirection(stepIndex[step] > currentStepIndex ? 'forward' : 'backward');
    setCurrentStep(step);
  }, [currentStepIndex]);

  const handleWelcomeComplete = useCallback(() => {
    goToStep('sport');
  }, [goToStep]);

  const handleSportSelect = useCallback((sport: string) => {
    setData((prev) => ({ ...prev, favoriteSport: sport }));
    saveProgress({ favoriteSport: sport, lastCompletedStep: 'sport' });
    goToStep('team');
  }, [goToStep, saveProgress]);

  const handleTeamSelect = useCallback((team: string | null) => {
    setData((prev) => ({ ...prev, favoriteTeam: team }));
    saveProgress({ favoriteTeam: team, lastCompletedStep: 'team' });
    goToStep('tutorial');
  }, [goToStep, saveProgress]);

  const handleTeamSkip = useCallback(() => {
    goToStep('tutorial');
  }, [goToStep]);

  const handleTutorialComplete = useCallback(async () => {
    // Sauvegarder les préférences dans le profil
    if (data.favoriteSport || data.favoriteTeam) {
      updateUser({
        profile: {
          ...(user?.profile ?? {
            bio: null,
            avatarUrl: null,
            level: 1,
            xp: 0,
            totalCoins: 0,
            totalDiamonds: 0,
            favoriteSport: null,
            favoriteTeam: null,
          }),
          favoriteSport: data.favoriteSport,
          favoriteTeam: data.favoriteTeam,
        },
      });
    }

    // Nettoyer la persistance
    clearProgress();

    // Redirection vers l'accueil
    navigate('/', { replace: true });
  }, [data, user, updateUser, navigate, clearProgress]);

  // ---------------------------------------------------------------------------
  // Protection : rediriger si déjà onboardé
  // ---------------------------------------------------------------------------

  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return <></>;
  }

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-wilo-bg-primary flex flex-col">
      {/* Barre de progression */}
      {currentStep !== 'welcome' && (
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center gap-2 max-w-md mx-auto">
            {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i < currentStepIndex - 1
                      ? 'var(--wilo-blue-500)'
                      : i === currentStepIndex - 1
                        ? 'var(--wilo-blue-400)'
                        : 'var(--bg-tertiary)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contenu de l'étape avec animation de transition */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <AnimatedTransition isVisible={currentStep === 'welcome'} animation="spring">
            <WelcomeStep onComplete={handleWelcomeComplete} />
          </AnimatedTransition>

          <AnimatedTransition isVisible={currentStep === 'sport'} animation="slide">
            <SportSelectStep
              selectedSport={data.favoriteSport}
              onSelect={handleSportSelect}
            />
          </AnimatedTransition>

          <AnimatedTransition isVisible={currentStep === 'team'} animation="slide">
            <TeamSelectStep
              selectedTeam={data.favoriteTeam}
              selectedSport={data.favoriteSport}
              onSelect={handleTeamSelect}
              onSkip={handleTeamSkip}
            />
          </AnimatedTransition>

          <AnimatedTransition isVisible={currentStep === 'tutorial'} animation="slide">
            <TutorialStep
              favoriteSport={data.favoriteSport}
              onComplete={handleTutorialComplete}
            />
          </AnimatedTransition>
        </div>
      </div>

      {/* Indicateur d'étape (points) */}
      {currentStep !== 'welcome' && (
        <div className="py-6 flex justify-center gap-2">
          {(['sport', 'team', 'tutorial'] as OnboardingStep[]).map((step) => (
            <button
              key={step}
              onClick={() => goToStep(step)}
              disabled={stepIndex[step] > currentStepIndex}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  step === currentStep
                    ? 'var(--wilo-blue-500)'
                    : stepIndex[step] < currentStepIndex
                      ? 'var(--wilo-blue-700)'
                      : 'var(--bg-tertiary)',
                transform: step === currentStep ? 'scale(1.5)' : 'scale(1)',
                cursor: stepIndex[step] > currentStepIndex ? 'default' : 'pointer',
              }}
              aria-label={`Étape ${stepIndex[step]}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}