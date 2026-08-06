// apps/web/src/pages/admin/components/CategoryList.tsx

import React from 'react';
import type { Category, Sport } from '../../../types/question';

interface CategoryListProps {
  categories: Category[];
  sports: Sport[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export default function CategoryList({
  categories,
  sports,
  onEdit,
  onDelete,
}: CategoryListProps): React.ReactElement {
  const getSportName = (sportId: string) => sports.find((s) => s.id === sportId)?.name ?? 'Inconnu';

  return (
    <div className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-wilo-bg-tertiary/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-wilo-blue-200">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-wilo-blue-200">Description</th>
              <th className="text-left px-4 py-3 font-medium text-wilo-blue-200">Sport</th>
              <th className="text-right px-4 py-3 font-medium text-wilo-blue-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wilo-bg-tertiary">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-wilo-bg-tertiary/30 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-wilo-blue-200 max-w-xs truncate">{cat.description || '-'}</td>
                <td className="px-4 py-3 text-wilo-blue-200">{getSportName(cat.sportId)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onEdit(cat)}
                    className="text-wilo-blue-400 hover:text-wilo-blue-300 mr-3 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(cat.id)}
                    className="text-wilo-red-400 hover:text-wilo-red-300 transition-colors"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}