// apps/web/src/pages/admin/AdminQuestionsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuestions } from '../../hooks/useQuestions';
import QuestionList from './components/QuestionList';
import QuestionForm from './components/QuestionForm';
import QuestionFilters from './components/QuestionFilters';
import type { Question, QuestionFormData } from '../../types/question';
import Button from '../../components/ui/Button';

type PageMode = 'list' | 'create' | 'edit';

export default function AdminQuestionsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const {
    questions,
    sports,
    categories,
    loading,
    error,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  } = useQuestions();

  const [mode, setMode] = useState<PageMode>('list');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [filterSport, setFilterSport] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filterFreshness, setFilterFreshness] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Protection admin
  if (authLoading) {
    return (
      <div className="min-h-screen bg-wilo-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-wilo-blue-500/30 border-t-wilo-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/', { replace: true });
    return <></>;
  }

  // Filtrage
  const filteredQuestions = questions.filter((q) => {
    const cat = categories.find((c) => c.id === q.categoryId);
    const sport = cat ? sports.find((s) => s.id === cat.sportId) : null;
    if (filterSport && sport?.id !== filterSport) return false;
    if (filterCategory && q.categoryId !== filterCategory) return false;
    if (filterDifficulty && q.difficultyLevel !== filterDifficulty) return false;
    if (searchText && !q.questionText.toLowerCase().includes(searchText.toLowerCase())) return false;
    // Filtre fraîcheur simplifié
    if (filterFreshness === 'fresh' && q.freshnessExpiresAt && new Date(q.freshnessExpiresAt) < new Date()) return false;
    if (filterFreshness === 'expired' && (!q.freshnessExpiresAt || new Date(q.freshnessExpiresAt) >= new Date())) return false;
    if (filterFreshness === 'expiring' && q.freshnessExpiresAt) {
      const daysLeft = (new Date(q.freshnessExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysLeft > 7 || daysLeft <= 0) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredQuestions.length / pageSize);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCreate = async (data: QuestionFormData) => {
    await createQuestion(data);
    setMode('list');
    setCurrentPage(1);
  };

  const handleUpdate = async (data: QuestionFormData) => {
    if (editingQuestion) {
      await updateQuestion(editingQuestion.id, data);
      setEditingQuestion(null);
      setMode('list');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette question ? Cette action est irréversible.')) {
      await deleteQuestion(id);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setMode('edit');
  };

  const handleCancel = () => {
    setEditingQuestion(null);
    setMode('list');
  };

  return (
    <div className="min-h-screen bg-wilo-bg-primary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Gestion des questions
            </h1>
            <p className="text-wilo-blue-200 text-sm mt-1">
              {questions.length} question(s) au total
            </p>
          </div>
          {mode === 'list' && (
            <Button onClick={() => setMode('create')} leftIcon={<span>+</span>}>
              Nouvelle question
            </Button>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-wilo-red-50 border border-wilo-red-200 rounded-lg text-wilo-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Mode formulaire */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-2xl p-6 mb-8">
            <h2 className="font-display text-xl font-bold text-white mb-6">
              {mode === 'create' ? 'Nouvelle question' : 'Modifier la question'}
            </h2>
            <QuestionForm
              sports={sports}
              categories={categories}
              initialData={
                editingQuestion
                  ? {
                      questionText: editingQuestion.questionText,
                      categoryId: editingQuestion.categoryId,
                      difficultyLevel: editingQuestion.difficultyLevel,
                      answers: editingQuestion.answers,
                      media: [],
                    }
                  : undefined
              }
              onSubmit={mode === 'create' ? handleCreate : handleUpdate}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Mode liste */}
        {mode === 'list' && (
          <>
            <QuestionFilters
              sports={sports}
              categories={categories}
              filterSport={filterSport}
              filterCategory={filterCategory}
              filterDifficulty={filterDifficulty}
              filterFreshness={filterFreshness}
              searchText={searchText}
              onSportChange={setFilterSport}
              onCategoryChange={setFilterCategory}
              onDifficultyChange={setFilterDifficulty}
              onFreshnessChange={setFilterFreshness}
              onSearchChange={setSearchText}
            />

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-wilo-blue-500/30 border-t-wilo-blue-500 rounded-full animate-spin" />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-16 bg-wilo-bg-secondary rounded-2xl border border-wilo-bg-tertiary">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-white mb-2">Aucune question trouvée</h3>
                <p className="text-wilo-blue-200 text-sm">
                  {questions.length === 0
                    ? 'Créez votre première question.'
                    : 'Essayez de modifier les filtres.'}
                </p>
              </div>
            ) : (
              <QuestionList
                questions={paginatedQuestions}
                categories={categories}
                sports={sports}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-lg text-sm text-wilo-blue-200 disabled:opacity-50"
                >
                  ← Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      currentPage === i + 1
                        ? 'bg-wilo-blue-500 text-white'
                        : 'bg-wilo-bg-secondary border border-wilo-bg-tertiary text-wilo-blue-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-lg text-sm text-wilo-blue-200 disabled:opacity-50"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}