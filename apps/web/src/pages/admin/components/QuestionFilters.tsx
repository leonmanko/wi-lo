// apps/web/src/pages/admin/components/QuestionFilters.tsx

import React from 'react';
import type { Sport, Category } from '../../../types/question';

interface QuestionFiltersProps {
  sports: Sport[];
  categories: Category[];
  filterSport: string;
  filterCategory: string;
  filterDifficulty: string;
  filterFreshness: string;
  searchText: string;
  onSportChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onFreshnessChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function QuestionFilters({
  sports,
  categories,
  filterSport,
  filterCategory,
  filterDifficulty,
  filterFreshness,
  searchText,
  onSportChange,
  onCategoryChange,
  onDifficultyChange,
  onFreshnessChange,
  onSearchChange,
}: QuestionFiltersProps): React.ReactElement {
  const filteredCategories = filterSport
    ? categories.filter((c) => c.sportId === filterSport)
    : categories;

  return (
    <div className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-2xl p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Recherche texte */}
        <div>
          <label className="block text-xs font-medium text-wilo-blue-300 mb-1">Recherche</label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher..."
            className="w-full px-3 py-2 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
          />
        </div>

        {/* Sport */}
        <div>
          <label className="block text-xs font-medium text-wilo-blue-300 mb-1">Sport</label>
          <select
            value={filterSport}
            onChange={(e) => {
              onSportChange(e.target.value);
              onCategoryChange('');
            }}
            className="w-full px-3 py-2 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
          >
            <option value="">Tous les sports</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-xs font-medium text-wilo-blue-300 mb-1">Catégorie</label>
          <select
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
          >
            <option value="">Toutes les catégories</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Difficulté */}
        <div>
          <label className="block text-xs font-medium text-wilo-blue-300 mb-1">Difficulté</label>
          <select
            value={filterDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full px-3 py-2 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
          >
            <option value="">Toutes</option>
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
        </div>

        {/* Fraîcheur */}
        <div>
          <label className="block text-xs font-medium text-wilo-blue-300 mb-1">Statut</label>
          <select
            value={filterFreshness}
            onChange={(e) => onFreshnessChange(e.target.value)}
            className="w-full px-3 py-2 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
          >
            <option value="">Tous</option>
            <option value="fresh">Frais</option>
            <option value="expiring">Périme bientôt</option>
            <option value="expired">Expiré</option>
          </select>
        </div>
      </div>
    </div>
  );
}