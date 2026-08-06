// apps/web/src/pages/admin/components/CategoryForm.tsx

import React, { useState } from 'react';
import type { Sport } from '../../../types/question';
import Button from '../../../components/ui/Button';

interface CategoryFormData {
  name: string;
  description: string;
  sportId: string;
}

interface CategoryFormProps {
  sports: Sport[];
  initialData?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

export default function CategoryForm({
  sports,
  initialData,
  onSubmit,
  onCancel,
}: CategoryFormProps): React.ReactElement {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || {
      name: '',
      description: '',
      sportId: sports[0]?.id ?? '',
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Le nom de la catégorie est requis.');
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-wilo-red-50 border border-wilo-red-200 rounded-lg text-wilo-red-500 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-wilo-blue-200 mb-1">Nom</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
          placeholder="Ex: Histoire, Joueurs..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-wilo-blue-200 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          className="w-full px-4 py-3 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-wilo-blue-500 resize-none"
          placeholder="Description optionnelle"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-wilo-blue-200 mb-1">Sport associé</label>
        <select
          value={formData.sportId}
          onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
          className="w-full px-4 py-3 bg-wilo-bg-primary border border-wilo-bg-tertiary rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
        >
          {sports.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

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