// apps/web/src/types/question.ts

export interface Sport {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  accentColor: string;
}

export interface Category {
  id: string;
  sportId: string;
  name: string;
  description: string;
}

export interface Question {
  id: string;
  categoryId: string;
  questionText: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  sourceFactId: string | null;
  freshnessExpiresAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  answers: Answer[];
  media: QuestionMedia[];
}

export interface Answer {
  id?: string;
  questionId?: string;
  answerText: string;
  isCorrect: boolean;
  order: number;
}

export interface QuestionMedia {
  id?: string;
  questionId?: string;
  mediaUrl: string;
  mediaType: 'image' | 'audio';
}

export interface QuestionFormData {
  questionText: string;
  categoryId: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  answers: Answer[];
  media: File[];
}

export type FreshnessStatus = 'fresh' | 'expiring' | 'expired';