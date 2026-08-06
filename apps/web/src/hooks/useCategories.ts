// apps/web/src/hooks/useCategories.ts

import { useState, useCallback } from 'react';
import type { Sport, Category } from '../types/question';

// Données mockées
const MOCK_SPORTS: Sport[] = [
  { id: 'football', name: 'Football', description: '', iconUrl: null, accentColor: '#4A90FF' },
  { id: 'basketball', name: 'Basketball', description: '', iconUrl: null, accentColor: '#FF6B35' },
  { id: 'tennis', name: 'Tennis', description: '', iconUrl: null, accentColor: '#FFD700' },
  { id: 'rugby', name: 'Rugby', description: '', iconUrl: null, accentColor: '#2EC4B6' },
];

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', sportId: 'football', name: 'Histoire', description: 'Moments historiques du football' },
  { id: 'cat2', sportId: 'football', name: 'Joueurs', description: 'Joueurs célèbres' },
  { id: 'cat3', sportId: 'basketball', name: 'NBA', description: 'Actualité NBA' },
  { id: 'cat4', sportId: 'tennis', name: 'Grand Chelem', description: 'Tournois du Grand Chelem' },
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [sports] = useState<Sport[]>(MOCK_SPORTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setCategories(MOCK_CATEGORIES);
    setLoading(false);
  }, []);

  const createCategory = useCallback(async (data: { name: string; description: string; sportId: string }) => {
    const newCategory: Category = {
      id: `cat${Date.now()}`,
      sportId: data.sportId,
      name: data.name,
      description: data.description,
    };
    setCategories((prev) => [...prev, newCategory]);
  }, []);

  const updateCategory = useCallback(async (id: string, data: { name: string; description: string; sportId: string }) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...data } : c
      )
    );
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    categories,
    sports,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}