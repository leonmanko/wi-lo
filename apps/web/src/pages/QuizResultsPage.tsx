// apps/web/src/pages/QuizResultsPage.tsx

import React, { useMemo } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { MockQuestion } from '../data/mockQuizQuestions';
import Button from '../components/ui/Button';
import ResultCard from '../components/quiz/ResultCard';

interface QuizResultData {
  score: number;
  totalQuestions: number;
  questions: MockQuestion[];
  userAnswers: (string | null)[];
}

export default function QuizResultsPage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const data = location.state as QuizResultData | null;

  // Protection
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

  if (!data) {
    return (
      <div className="min-h-screen bg-wilo-bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Aucun résultat disponible.</p>
          <Link to="/quiz" className="text-wilo-blue-400 hover:text-wilo-blue-300">
            Lancer un quiz
          </Link>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, questions, userAnswers } = data;

  // Statistiques
  const correctAnswers = questions.filter(
    (q, i) => userAnswers[i] && q.answers.find((a) => a.isCorrect)?.text === userAnswers[i]
  ).length;

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const maxScore = questions.reduce((sum, q) => sum + 5, 0); // 5 points par question max
  const scorePercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  // Message personnalisé selon la performance
  const performanceMessage = useMemo(() => {
    if (accuracy >= 90) return { emoji: '🏆', text: 'Excellent !' };
    if (accuracy >= 70) return { emoji: '👏', text: 'Bien joué !' };
    if (accuracy >= 50) return { emoji: '💪', text: 'Pas mal !' };
    return { emoji: '📚', text: 'Continue à t\'entraîner !' };
  }, [accuracy]);

  const handleReplay = () => {
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-wilo-bg-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Score principal */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-wilo-blue-500/10 border-2 border-wilo-blue-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">{performanceMessage.emoji}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            {performanceMessage.text}
          </h1>
          <p className="text-wilo-blue-200 text-sm">Quiz terminé</p>
        </div>

        {/* Cartes de stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{correctAnswers}/{totalQuestions}</p>
            <p className="text-xs text-wilo-blue-200 mt-1">Bonnes réponses</p>
          </div>
          <div className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-wilo-blue-400">{accuracy}%</p>
            <p className="text-xs text-wilo-blue-200 mt-1">Précision</p>
          </div>
          <div className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-xl p-4 text-center col-span-2 sm:col-span-1">
            <p className="text-2xl font-bold text-wilo-gold-500">{score}</p>
            <p className="text-xs text-wilo-blue-200 mt-1">Points</p>
          </div>
        </div>

        <div className="mb-6">
          <ResultCard
            score={score}
            totalQuestions={totalQuestions}
            correctAnswers={correctAnswers}
            accuracy={accuracy}
            sportName="Football"
            questions={questions}
            userAnswers={userAnswers}
          />
        </div>

        {/* Résumé question par question */}
        <div className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-2xl p-4 mb-6">
          <h3 className="text-sm font-medium text-wilo-blue-200 mb-3">Détail des réponses</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {questions.map((q, i) => {
              const userAnswer = userAnswers[i];
              const correctAnswer = q.answers.find((a) => a.isCorrect)?.text || '';
              const isCorrect = userAnswer === correctAnswer;

              return (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isCorrect ? 'bg-wilo-green-500/20 text-wilo-green-400' : 'bg-wilo-red-500/20 text-wilo-red-400'
                    }`}
                  >
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{q.questionText}</p>
                    <p className="text-xs text-wilo-blue-300 mt-0.5">
                      Ta réponse :{' '}
                      <span className={isCorrect ? 'text-wilo-green-400' : 'text-wilo-red-400'}>
                        {userAnswer || 'Pas de réponse'}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-wilo-green-400">
                        Réponse : {correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="primary" fullWidth onClick={handleReplay}>
            🔄 Rejouer
          </Button>
          <Button variant="outline" fullWidth>
            📤 Partager
          </Button>
        </div>

        <p className="text-center text-xs text-wilo-blue-700 mt-4">
          <Link to="/" className="hover:text-wilo-blue-400 transition-colors">
            Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}