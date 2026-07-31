// apps/web/src/pages/admin/components/QuestionList.tsx

import React from 'react';
import type { Question, Category, Sport } from '../../../types/question';
import Badge from '../../../components/ui/Badge';

interface QuestionListProps {
  questions: Question[];
  categories: Category[];
  sports: Sport[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

export default function QuestionList({
  questions,
  categories,
  sports,
  onEdit,
  onDelete,
}: QuestionListProps): React.ReactElement {
  const getCategory = (catId: string) => categories.find((c) => c.id === catId);
  const getSport = (catId: string) => {
    const cat = getCategory(catId);
    return cat ? sports.find((s) => s.id === cat.sportId) : null;
  };

  const getDifficultyBadge = (level: string) => {
    switch (level) {
      case 'easy':
        return <Badge variant="success">Facile</Badge>;
      case 'medium':
        return <Badge variant="warning">Moyen</Badge>;
      case 'hard':
        return <Badge variant="error">Difficile</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  const getFreshnessStatus = (expiresAt: string | null): { label: string; variant: 'success' | 'warning' | 'error' } => {
    if (!expiresAt) return { label: 'Permanent', variant: 'success' };
    const daysLeft = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysLeft <= 0) return { label: 'Expiré', variant: 'error' };
    if (daysLeft <= 7) return { label: 'Expire bientôt', variant: 'warning' };
    return { label: 'Frais', variant: 'success' };
  };

  return (
    <div className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-wilo-bg-tertiary/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-wilo-blue-200">Question</th>
              <th className="text-left px-4 py-3 font-medium text-wilo-blue-200">Sport</th>
              <th className="text-left px-4 py-3 font-medium text-wilo-blue-200">Catégorie</th>
              <th className="text-left px-4 py-3 font-medium text-wilo-blue-200">Difficulté</th>
              <th className="text-left px-4 py-3 font-medium text-wilo-blue-200">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-wilo-blue-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wilo-bg-tertiary">
            {questions.map((q) => {
              const sport = getSport(q.categoryId);
              const category = getCategory(q.categoryId);
              const freshness = getFreshnessStatus(q.freshnessExpiresAt);

              return (
                <tr key={q.id} className="hover:bg-wilo-bg-tertiary/30 transition-colors">
                  <td className="px-4 py-3 text-white max-w-xs truncate" title={q.questionText}>
                    {q.questionText}
                  </td>
                  <td className="px-4 py-3 text-wilo-blue-200">{sport?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-wilo-blue-200">{category?.name ?? '-'}</td>
                  <td className="px-4 py-3">{getDifficultyBadge(q.difficultyLevel)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={freshness.variant}>{freshness.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onEdit(q)}
                      className="text-wilo-blue-400 hover:text-wilo-blue-300 mr-3 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onDelete(q.id)}
                      className="text-wilo-red-400 hover:text-wilo-red-300 transition-colors"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
