// apps/web/src/pages/QuizPlayPage.tsx

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQuizEngine } from '../hooks/useQuizEngine';

export default function QuizPlayPage(): React.ReactElement {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();

  const sport = searchParams.get('sport') || 'football';
  const count = parseInt(searchParams.get('count') || '10', 10);

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    timeLeft,
    isAnswered,
    selectedAnswer,
    isCorrect,
    isFinished,
    questions,
    answers,
    selectAnswer,
    goToNextQuestion,
  } = useQuizEngine(sport, count);

  // Rediriger vers les résultats une fois terminé
  useEffect(() => {
    if (isFinished) {
      navigate('/quiz/results', {
        state: {
          score,
          totalQuestions,
          questions,
          userAnswers: answers,
        },
      });
    }
  }, [isFinished, navigate, score, totalQuestions, questions, answers]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-wilo-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-wilo-blue-500/30 border-t-wilo-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-wilo-bg-primary flex items-center justify-center">
        <p className="text-white">Chargement des questions...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return <></>; // ne devrait pas arriver
  }

  const progressPercent = ((currentIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100;
  const timerColor =
    timeLeft <= 5 ? 'var(--wilo-red-500)' : timeLeft <= 10 ? 'var(--wilo-yellow-500)' : 'var(--wilo-blue-500)';
  const timerScale = timeLeft <= 5 ? 'scale(1.1)' : 'scale(1)';

  return (
    <div className="min-h-screen bg-wilo-bg-primary flex flex-col">
      {/* Barre de progression et timer */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-wilo-blue-200">
            Question {currentIndex + 1}/{totalQuestions}
          </span>
          <span
            className="font-display text-2xl font-bold transition-all"
            style={{ color: timerColor, transform: timerScale }}
          >
            0:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="h-1.5 bg-wilo-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-wilo-blue-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Zone de la question */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              {currentQuestion.questionText}
            </h2>

            {currentQuestion.media && (
              <div className="mb-4">
                {currentQuestion.media.type === 'image' ? (
                  <img
                    src={currentQuestion.media.url}
                    alt="Média de la question"
                    className="w-full rounded-lg object-cover max-h-48"
                  />
                ) : (
                  <audio controls className="w-full mt-2">
                    <source src={currentQuestion.media.url} type="audio/mpeg" />
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                )}
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.answers.map((answer) => {
                const isSelected = selectedAnswer === answer.text;
                const showCorrect = isAnswered && answer.isCorrect;
                const showIncorrect = isAnswered && isSelected && !answer.isCorrect;

                let bgColor = 'bg-wilo-bg-primary border-wilo-bg-tertiary';
                if (showCorrect) bgColor = 'bg-wilo-green-500/20 border-wilo-green-500';
                else if (showIncorrect) bgColor = 'bg-wilo-red-500/20 border-wilo-red-500';
                else if (isSelected && !isAnswered) bgColor = 'bg-wilo-blue-500/20 border-wilo-blue-500';

                return (
                  <button
                    key={answer.text}
                    onClick={() => selectAnswer(answer.text)}
                    disabled={isAnswered}
                    className={`w-full text-left px-4 py-3 rounded-xl border font-medium transition-all ${bgColor} ${
                      isAnswered ? 'cursor-default' : 'cursor-pointer hover:border-wilo-blue-400'
                    }`}
                  >
                    <span className="text-white">{answer.text}</span>
                    {showCorrect && <span className="float-right text-wilo-green-400">✓</span>}
                    {showIncorrect && <span className="float-right text-wilo-red-400">✗</span>}
                  </button>
                );
              })}
            </div>

            {/* Feedback + bouton suivant */}
            {isAnswered && (
              <div className="mt-6 flex flex-col items-center gap-3 animate-fade-in">
                <p className={`text-lg font-bold ${isCorrect ? 'text-wilo-green-400' : 'text-wilo-red-400'}`}>
                  {isCorrect ? `+${Math.ceil(timeLeft / 3)} points !` : 'Temps écoulé ou incorrect'}
                </p>
                <button
                  onClick={goToNextQuestion}
                  className="px-6 py-2 bg-wilo-blue-500 hover:bg-wilo-blue-600 text-white rounded-lg font-semibold transition-all"
                >
                  {currentIndex + 1 < totalQuestions ? 'Suivant' : 'Voir les résultats'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Score actuel (mini) */}
      <div className="px-4 py-3 text-center text-sm text-wilo-blue-200">
        Score : <span className="text-white font-bold">{score}</span>
      </div>
    </div>
  );
}