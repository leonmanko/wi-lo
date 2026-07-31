// apps/web/src/hooks/useQuestions.ts

import { useState, useCallback } from 'react';
import type { Question, QuestionFormData, Sport, Category } from '../types/question';

// Données mockées pour le développement
const MOCK_SPORTS: Sport[] = [
  { id: 'football', name: 'Football', description: '', iconUrl: null, accentColor: '#4A90FF' },
  { id: 'basketball', name: 'Basketball', description: '', iconUrl: null, accentColor: '#FF6B35' },
  { id: 'tennis', name: 'Tennis', description: '', iconUrl: null, accentColor: '#FFD700' },
];

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', sportId: 'football', name: 'Histoire', description: '' },
  { id: 'cat2', sportId: 'football', name: 'Joueurs', description: '' },
  { id: 'cat3', sportId: 'basketball', name: 'NBA', description: '' },
];

const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    categoryId: 'cat1',
    questionText: 'Qui a remporté la Ligue des Champions 2023 ?',
    difficultyLevel: 'medium',
    sourceFactId: null,
    freshnessExpiresAt: '2026-08-15T00:00:00Z',
    createdBy: 'admin',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    answers: [
      { answerText: 'Manchester City', isCorrect: true, order: 0 },
      { answerText: 'Real Madrid', isCorrect: false, order: 1 },
      { answerText: 'Inter Milan', isCorrect: false, order: 2 },
      { answerText: 'Bayern Munich', isCorrect: false, order: 3 },
    ],
    media: [],
  },
  {
    id: 'q2',
    categoryId: 'cat2',
    questionText: 'Quel joueur a marqué le plus de buts en Ligue 1 en 2025 ?',
    difficultyLevel: 'hard',
    sourceFactId: null,
    freshnessExpiresAt: '2026-07-20T00:00:00Z',
    createdBy: 'admin',
    createdAt: '2026-06-15T00:00:00Z',
    updatedAt: '2026-06-15T00:00:00Z',
    answers: [
      { answerText: 'Kylian Mbappé', isCorrect: true, order: 0 },
      { answerText: 'Lionel Messi', isCorrect: false, order: 1 },
      { answerText: 'Neymar', isCorrect: false, order: 2 },
    ],
    media: [{ mediaUrl: '/placeholder.jpg', mediaType: 'image' }],
  },
];

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [sports] = useState<Sport[]>(MOCK_SPORTS);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    // Simuler un délai réseau
    await new Promise((r) => setTimeout(r, 500));
    setQuestions(MOCK_QUESTIONS);
    setLoading(false);
  }, []);

  const createQuestion = useCallback(async (data: QuestionFormData) => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      categoryId: data.categoryId,
      questionText: data.questionText,
      difficultyLevel: data.difficultyLevel,
      sourceFactId: null,
      freshnessExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers: data.answers.map((a, i) => ({ ...a, order: i })),
      media: [],
    };
    setQuestions((prev) => [newQuestion, ...prev]);
  }, []);

  const updateQuestion = useCallback(async (id: string, data: Partial<QuestionFormData>) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              questionText: data.questionText ?? q.questionText,
              categoryId: data.categoryId ?? q.categoryId,
              difficultyLevel: data.difficultyLevel ?? q.difficultyLevel,
              answers: data.answers ?? q.answers,
              updatedAt: new Date().toISOString(),
            }
          : q
      )
    );
  }, []);

  const deleteQuestion = useCallback(async (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  return {
    questions,
    sports,
    categories,
    loading,
    error,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
}