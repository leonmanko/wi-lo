import { pgTable, uuid, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { quizSessions } from './quiz_sessions';
import { questions } from './questions';

export const quizAnswers = pgTable('quiz_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => quizSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  questionId: uuid('question_id').notNull().references(() => questions.id),
  selectedAnswerId: uuid('selected_answer_id'), // nullable si non répondu
  isCorrect: boolean('is_correct'),
  timeTakenMs: integer('time_taken_ms'), // ms, chronométré côté serveur
  answeredAt: timestamp('answered_at', { withTimezone: true }).defaultNow(),
});