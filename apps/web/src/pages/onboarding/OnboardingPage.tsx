// apps/web/src/pages/onboarding/OnboardingPage.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import WelcomeStep from './steps/WelcomeStep';
import SportSelectStep from './steps/SportSelectStep';
import TeamSelectStep from './steps/TeamSelectStep';
import TutorialStep from './steps/TutorialStep';

type OnboardingStep = 'welcome' | 'sport' | 'team' | 'tutorial';

interface OnboardingData {
  favoriteSport: string | null;
  favoriteTeam: string | null;
}

const STEP_ORDER: Record<OnboardingStep, number> = {
  welcome: 0,
  sport: 1,
  team: 2,
  tutorial: 3,
};

export default function OnboardingPage(): React.ReactElement {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [data, setData] = useState<OnboardingData>({
    favoriteSport: user?.profile?.favoriteSport ?? null,
    favoriteTeam: user?.profile?.favoriteTeam ?? null,
  });

  const currentStepIndex = useMemo(() => STEP_ORDER[currentStep], [currentStep]);

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
  }, []);

  const handleWelcomeComplete = useCallback(() => {
    goToStep('sport');
  }, [goToStep]);

  const handleSportSelect = useCallback((sport: string) => {
    setData((prev) => ({ ...prev, favoriteSport: sport }));
    goToStep('team');
  }, [goToStep]);

  const handleTeamSelect = useCallback((team: string | null) => {
    setData((prev) => ({ ...prev, favoriteTeam: team }));
    goToStep('tutorial');
  }, [goToStep]);

  const handleTeamSkip = useCallback(() => {
    goToStep('tutorial');
  }, [goToStep]);

  const handleTutorialComplete = useCallback(async () => {
    if (data.favoriteSport || data.favoriteTeam) {
      updateUser({
        profile: {
          ...(user?.profile ?? {
            bio: null, avatarUrl: null, level: 1, xp: 0,
            totalCoins: 0, totalDiamonds: 0,
            favoriteSport: null, favoriteTeam: null,
          }),
          favoriteSport: data.favoriteSport,
          favoriteTeam: data.favoriteTeam,
        },
      });
    }
    navigate('/', { replace: true });
  }, [data, user, updateUser, navigate]);

  // Protection : rediriger si non authentifié (sans boucle)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-wilo-bg-primary flex flex-col">
      {currentStep !== 'welcome' && (
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center gap-2 max-w-md mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i < currentStepIndex
                      ? 'var(--wilo-blue-500)'
                      : i === currentStepIndex
                        ? 'var(--wilo-blue-400)'
                        : 'var(--bg-tertiary)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {currentStep === 'welcome' && (
            <WelcomeStep onComplete={handleWelcomeComplete} />
          )}
          {currentStep === 'sport' && (
            <SportSelectStep
              selectedSport={data.favoriteSport}
              onSelect={handleSportSelect}
            />
          )}
          {currentStep === 'team' && (
            <TeamSelectStep
              selectedTeam={data.favoriteTeam}
              selectedSport={data.favoriteSport}
              onSelect={handleTeamSelect}
              onSkip={handleTeamSkip}
            />
          )}
          {currentStep === 'tutorial' && (
            <TutorialStep
              favoriteSport={data.favoriteSport}
              onComplete={handleTutorialComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}