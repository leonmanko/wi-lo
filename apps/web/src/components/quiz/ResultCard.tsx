// apps/web/src/components/quiz/ResultCard.tsx

import React from 'react';
import type { MockQuestion } from '../../data/mockQuizQuestions';

interface ResultCardProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  sportName: string;
  questions: MockQuestion[];
  userAnswers: (string | null)[];
  userName?: string;
}

export default function ResultCard({
  score,
  totalQuestions,
  correctAnswers,
  accuracy,
  sportName,
  questions,
  userAnswers,
  userName = 'Joueur WI-LO',
}: ResultCardProps): React.ReactElement {
  return (
    <div
      id="wi-lo-result-card"
      className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-2xl p-6 text-white"
      style={{ maxWidth: 400, margin: '0 auto' }}
    >
      {/* En-tête */}
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--wilo-blue-500)' }}>
          WI<span style={{ color: 'var(--wilo-gold-500)' }}>-</span>LO
        </h2>
        <p className="text-xs text-wilo-blue-300 mt-1">Quiz {sportName}</p>
        <p className="text-xs text-wilo-blue-500 mt-1">{userName}</p>
      </div>

      {/* Score principal */}
      <div className="text-center mb-6">
        <p className="text-4xl font-display font-bold text-wilo-blue-400">{score}</p>
        <p className="text-sm text-wilo-blue-200">points</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-wilo-bg-primary rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-white">{correctAnswers}/{totalQuestions}</p>
          <p className="text-xs text-wilo-blue-300">Bonnes réponses</p>
        </div>
        <div className="bg-wilo-bg-primary rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-wilo-blue-400">{accuracy}%</p>
          <p className="text-xs text-wilo-blue-300">Précision</p>
        </div>
        <div className="bg-wilo-bg-primary rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-wilo-gold-500">{getEmoji(accuracy)}</p>
          <p className="text-xs text-wilo-blue-300">{getRank(accuracy)}</p>
        </div>
      </div>

      {/* Questions rapides */}
      <div className="space-y-1">
        {questions.map((q, i) => {
          const userAnswer = userAnswers[i];
          const correctAnswer = q.answers.find((a) => a.isCorrect)?.text || '';
          const isCorrect = userAnswer === correctAnswer;
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={isCorrect ? 'text-wilo-green-400' : 'text-wilo-red-400'}>
                {isCorrect ? '✓' : '✗'}
              </span>
              <span className="text-wilo-blue-200 truncate flex-1">{q.questionText}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-wilo-blue-700 mt-4">
        Joue sur WI-LO et défie tes amis !
      </p>
    </div>
  );
}

function getEmoji(accuracy: number): string {
  if (accuracy >= 90) return '🏆';
  if (accuracy >= 70) return '👏';
  if (accuracy >= 50) return '💪';
  return '📚';
}

function getRank(accuracy: number): string {
  if (accuracy >= 90) return 'Légende';
  if (accuracy >= 70) return 'Expert';
  if (accuracy >= 50) return 'Amateur';
  return 'Débutant';
}