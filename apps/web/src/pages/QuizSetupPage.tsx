// apps/web/src/pages/QuizSetupPage.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQuestions } from '../hooks/useQuestions';
import Button from '../components/ui/Button';

/**
 * Page /quiz — Sélection des paramètres du quiz.
 * 
 * L'utilisateur choisit :
 * - Un sport
 * - Une catégorie (filtrée par le sport choisi)
 * - Une difficulté
 * - Un nombre de questions (5, 10, 15, 20)
 * 
 * Puis lance le quiz. Les paramètres sont passés via l'URL de /quiz/play.
 * 
 * États couverts :
 * - Chargement (sports/catégories)
 * - Erreur (données non disponibles)
 * - Formulaire valide / invalide
 * - Bouton désactivé si paramètres incomplets
 */

const QUESTION_COUNTS = [5, 10, 15, 20];
const DIFFICULTIES = [
  { value: 'easy', label: 'Facile' },
  { value: 'medium', label: 'Moyen' },
  { value: 'hard', label: 'Difficile' },
] as const;

export default function QuizSetupPage(): React.ReactElement {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { sports, categories, loading, error } = useQuestions();

  const [selectedSport, setSelectedSport] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(10);

  // Catégories filtrées par le sport sélectionné
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.sportId === selectedSport),
    [categories, selectedSport]
  );

  // Réinitialiser la catégorie si le sport change
  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId);
    setSelectedCategory('');
  };

  const canStartQuiz = selectedSport && selectedCategory;

  const handleStartQuiz = () => {
    if (!canStartQuiz) return;
    navigate(
      `/quiz/play?sport=${selectedSport}&category=${selectedCategory}&difficulty=${difficulty}&count=${questionCount}`
    );
  };

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

  return (
    <div className="min-h-screen bg-wilo-bg-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-bold text-white text-center mb-2">
          Configurer le quiz
        </h1>
        <p className="text-wilo-blue-200 text-sm text-center mb-8">
          Choisissez vos préférences pour cette session
        </p>

        {error && (
          <div className="mb-6 p-4 bg-wilo-red-50 border border-wilo-red-200 rounded-lg text-wilo-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-2xl p-6 space-y-5">
          {/* Sport */}
          <div>
            <label className="block text-sm font-medium text-wilo-blue-200 mb-2">
              Sport
            </label>
            {loading ? (
              <div className="h-10 bg-wilo-bg-tertiary rounded-lg animate-pulse" />
            ) : (
              <select
                value={selectedSport}
                onChange={(e) => handleSportChange(e.target.value)}
                className="w-full px-4 py-3 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
              >
                <option value="">Sélectionner un sport</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-wilo-blue-200 mb-2">
              Catégorie
            </label>
            {loading ? (
              <div className="h-10 bg-wilo-bg-tertiary rounded-lg animate-pulse" />
            ) : (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={!selectedSport || filteredCategories.length === 0}
                className="w-full px-4 py-3 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-wilo-blue-500 disabled:opacity-50"
              >
                <option value="">
                  {selectedSport
                    ? filteredCategories.length === 0
                      ? 'Aucune catégorie disponible'
                      : 'Sélectionner une catégorie'
                    : 'Choisissez d\'abord un sport'}
                </option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Difficulté */}
          <div>
            <label className="block text-sm font-medium text-wilo-blue-200 mb-2">
              Difficulté
            </label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${
                    difficulty === d.value
                      ? d.value === 'easy'
                        ? 'bg-wilo-green-500/20 border-wilo-green-500 text-wilo-green-500'
                        : d.value === 'medium'
                        ? 'bg-wilo-yellow-500/20 border-wilo-yellow-500 text-wilo-yellow-500'
                        : 'bg-wilo-red-500/20 border-wilo-red-500 text-wilo-red-500'
                      : 'bg-wilo-bg-primary border-wilo-bg-tertiary text-wilo-blue-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre de questions */}
          <div>
            <label className="block text-sm font-medium text-wilo-blue-200 mb-2">
              Nombre de questions
            </label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${
                    questionCount === count
                      ? 'bg-wilo-blue-500/20 border-wilo-blue-500 text-wilo-blue-400'
                      : 'bg-wilo-bg-primary border-wilo-bg-tertiary text-wilo-blue-200'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton Lancer */}
          <Button
            fullWidth
            size="lg"
            disabled={!canStartQuiz}
            onClick={handleStartQuiz}
          >
            ⚡ Lancer le quiz
          </Button>
        </div>
      </div>
    </div>
  );
}