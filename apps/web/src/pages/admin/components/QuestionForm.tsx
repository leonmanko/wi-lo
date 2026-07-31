// apps/web/src/pages/admin/components/QuestionForm.tsx

import React, { useState } from 'react';
import type { Sport, Category, QuestionFormData, Answer } from '../../../types/question';
import Button from '../../../components/ui/Button';

interface QuestionFormProps {
  sports: Sport[];
  categories: Category[];
  initialData?: QuestionFormData;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  onCancel: () => void;
}

export default function QuestionForm({
  sports,
  categories,
  initialData,
  onSubmit,
  onCancel,
}: QuestionFormProps): React.ReactElement {
  const [formData, setFormData] = useState<QuestionFormData>(
    initialData || {
      questionText: '',
      categoryId: categories[0]?.id ?? '',
      difficultyLevel: 'medium',
      answers: [
        { answerText: '', isCorrect: true, order: 0 },
        { answerText: '', isCorrect: false, order: 1 },
        { answerText: '', isCorrect: false, order: 2 },
        { answerText: '', isCorrect: false, order: 3 },
      ],
      media: [],
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSport = categories.find((c) => c.id === formData.categoryId)?.sportId;
  const filteredCategories = selectedSport
    ? categories.filter((c) => c.sportId === selectedSport)
    : categories;

  const handleChange = (field: string, value: string | Answer[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (index: number, field: string, value: string | boolean) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    // Si on coche "correct" sur une réponse, décocher les autres
    if (field === 'isCorrect' && value === true) {
      newAnswers.forEach((a, i) => {
        if (i !== index) a.isCorrect = false;
      });
    }
    handleChange('answers', newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation basique
    if (!formData.questionText.trim()) {
      setError('La question est requise.');
      return;
    }
    if (formData.answers.some((a) => !a.answerText.trim())) {
      setError('Toutes les réponses doivent être remplies.');
      return;
    }
    if (!formData.answers.some((a) => a.isCorrect)) {
      setError('Au moins une réponse doit être marquée comme correcte.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-wilo-red-50 border border-wilo-red-200 rounded-lg text-wilo-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Question */}
      <div>
        <label className="block text-sm font-medium text-wilo-blue-200 mb-1">Question</label>
        <textarea
          value={formData.questionText}
          onChange={(e) => handleChange('questionText', e.target.value)}
          rows={2}
          className="w-full px-4 py-3 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-wilo-blue-500 resize-none"
          placeholder="Ex: Qui a remporté la Ligue des Champions 2023 ?"
        />
      </div>

      {/* Sport → Catégorie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-wilo-blue-200 mb-1">Sport</label>
          <select
            value={selectedSport ?? ''}
            onChange={(e) => {
              const newCat = categories.find((c) => c.sportId === e.target.value);
              handleChange('categoryId', newCat?.id ?? '');
            }}
            className="w-full px-4 py-3 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
          >
            <option value="">Sélectionner un sport</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-wilo-blue-200 mb-1">Catégorie</label>
          <select
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            className="w-full px-4 py-3 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
          >
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Difficulté */}
      <div>
        <label className="block text-sm font-medium text-wilo-blue-200 mb-1">Difficulté</label>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleChange('difficultyLevel', level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                formData.difficultyLevel === level
                  ? level === 'easy'
                    ? 'bg-wilo-green-500/20 border-wilo-green-500 text-wilo-green-500'
                    : level === 'medium'
                    ? 'bg-wilo-yellow-500/20 border-wilo-yellow-500 text-wilo-yellow-500'
                    : 'bg-wilo-red-500/20 border-wilo-red-500 text-wilo-red-500'
                  : 'bg-wilo-bg-primary border-wilo-bg-tertiary text-wilo-blue-200'
              }`}
            >
              {level === 'easy' ? 'Facile' : level === 'medium' ? 'Moyen' : 'Difficile'}
            </button>
          ))}
        </div>
      </div>

      {/* Réponses */}
      <div>
        <label className="block text-sm font-medium text-wilo-blue-200 mb-2">
          Réponses (2-4) — cochez la bonne réponse
        </label>
        <div className="space-y-2">
          {formData.answers.map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctAnswer"
                checked={answer.isCorrect}
                onChange={() => handleAnswerChange(index, 'isCorrect', true)}
                className="w-4 h-4 accent-wilo-green-500"
              />
              <input
                type="text"
                value={answer.answerText}
                onChange={(e) => handleAnswerChange(index, 'answerText', e.target.value)}
                placeholder={`Réponse ${index + 1}`}
                className="flex-1 px-3 py-2 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Médias (placeholder) */}
      <div>
        <label className="block text-sm font-medium text-wilo-blue-200 mb-1">Médias (optionnel)</label>
        <input
          type="file"
          accept="image/*,audio/*"
          multiple
          className="text-sm text-wilo-blue-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-wilo-blue-500 file:text-white hover:file:bg-wilo-blue-600"
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
      </div>
    </form>
  );
}