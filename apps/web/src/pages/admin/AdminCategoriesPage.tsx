// apps/web/src/pages/admin/AdminCategoriesPage.tsx

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import CategoryList from './components/CategoryList';
import CategoryForm from './components/CategoryForm';
import type { Category } from '../../types/question';
import Button from '../../components/ui/Button';

type PageMode = 'list' | 'create' | 'edit';

export default function AdminCategoriesPage(): React.ReactElement {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const {
    categories,
    sports,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [mode, setMode] = useState<PageMode>('list');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterSport, setFilterSport] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Protection admin
  if (authLoading) {
    return (
      <div className="min-h-screen bg-wilo-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-wilo-blue-500/30 border-t-wilo-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const filteredCategories = filterSport
    ? categories.filter((c) => c.sportId === filterSport)
    : categories;

  const handleCreate = async (data: { name: string; description: string; sportId: string }) => {
    await createCategory(data);
    setMode('list');
  };

  const handleUpdate = async (data: { name: string; description: string; sportId: string }) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
      setEditingCategory(null);
      setMode('list');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette catégorie ? Les questions associées pourraient être orphelines.')) {
      await deleteCategory(id);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setMode('edit');
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setMode('list');
  };

  return (
    <div className="min-h-screen bg-wilo-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Gestion des catégories
            </h1>
            <p className="text-wilo-blue-200 text-sm mt-1">
              {categories.length} catégorie(s)
            </p>
          </div>
          {mode === 'list' && (
            <Button onClick={() => setMode('create')} leftIcon={<span>+</span>}>
              Nouvelle catégorie
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-wilo-red-50 border border-wilo-red-200 rounded-lg text-wilo-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Formulaire */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-2xl p-6 mb-8">
            <h2 className="font-display text-xl font-bold text-white mb-6">
              {mode === 'create' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
            </h2>
            <CategoryForm
              sports={sports}
              initialData={
                editingCategory
                  ? {
                      name: editingCategory.name,
                      description: editingCategory.description,
                      sportId: editingCategory.sportId,
                    }
                  : undefined
              }
              onSubmit={mode === 'create' ? handleCreate : handleUpdate}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Liste */}
        {mode === 'list' && (
          <>
            {/* Filtre sport */}
            <div className="mb-6 flex items-center gap-4">
              <label className="text-sm font-medium text-wilo-blue-200">Filtrer par sport :</label>
              <select
                value={filterSport}
                onChange={(e) => setFilterSport(e.target.value)}
                className="px-3 py-2 bg-wilo-bg-secondary border border-wilo-bg-tertiary rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-wilo-blue-500"
              >
                <option value="">Tous les sports</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-wilo-blue-500/30 border-t-wilo-blue-500 rounded-full animate-spin" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-16 bg-wilo-bg-secondary rounded-2xl border border-wilo-bg-tertiary">
                <div className="text-4xl mb-4">📂</div>
                <h3 className="text-lg font-semibold text-white mb-2">Aucune catégorie trouvée</h3>
                <p className="text-wilo-blue-200 text-sm">
                  {categories.length === 0
                    ? 'Créez votre première catégorie.'
                    : 'Essayez de modifier le filtre.'}
                </p>
              </div>
            ) : (
              <CategoryList
                categories={filteredCategories}
                sports={sports}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}