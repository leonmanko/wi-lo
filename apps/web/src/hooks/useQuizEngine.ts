// apps/web/src/hooks/useQuizEngine.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { getMockQuestions, MockQuestion } from '../data/mockQuizQuestions';

interface QuizState {
  questions: MockQuestion[];
  currentIndex: number;
  score: number;
  answers: (string | null)[];
  timeLeft: number;
  isAnswered: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  isFinished: boolean;
}

const TIME_PER_QUESTION = 15; // secondes

export function useQuizEngine(sport: string, count: number) {
  const [state, setState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    timeLeft: TIME_PER_QUESTION,
    isAnswered: false,
    selectedAnswer: null,
    isCorrect: null,
    isFinished: false,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialiser les questions
  useEffect(() => {
    const questions = getMockQuestions(sport, count);
    setState((prev) => ({
      ...prev,
      questions,
      answers: new Array(questions.length).fill(null),
    }));
  }, [sport, count]);

  // Démarrer / réinitialiser le timer à chaque nouvelle question
  useEffect(() => {
    if (state.isFinished || state.questions.length === 0) return;

    setState((prev) => ({ ...prev, timeLeft: TIME_PER_QUESTION }));

    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.isAnswered || prev.timeLeft <= 1) {
          // Temps écoulé ou déjà répondu
          clearInterval(timerRef.current!);
          if (!prev.isAnswered) {
            // Temps écoulé sans réponse
            return {
              ...prev,
              isAnswered: true,
              selectedAnswer: null,
              isCorrect: false,
            };
          }
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.currentIndex, state.isFinished]);

  const currentQuestion = state.questions[state.currentIndex] || null;

  const selectAnswer = useCallback(
    (answerText: string) => {
      if (state.isAnswered || !currentQuestion) return;

      const correct = currentQuestion.answers.find((a) => a.text === answerText)?.isCorrect ?? false;
      const points = correct ? Math.ceil(state.timeLeft / 3) : 0;

      setState((prev) => {
        const newAnswers = [...prev.answers];
        newAnswers[prev.currentIndex] = answerText;
        return {
          ...prev,
          isAnswered: true,
          selectedAnswer: answerText,
          isCorrect: correct,
          score: prev.score + points,
          answers: newAnswers,
        };
      });
    },
    [state.isAnswered, state.timeLeft, currentQuestion]
  );

  const goToNextQuestion = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.questions.length) {
        return { ...prev, isFinished: true };
      }
      return {
        ...prev,
        currentIndex: nextIndex,
        isAnswered: false,
        selectedAnswer: null,
        isCorrect: null,
        timeLeft: TIME_PER_QUESTION,
      };
    });
  }, []);

  return {
    currentQuestion,
    currentIndex: state.currentIndex,
    totalQuestions: state.questions.length,
    score: state.score,
    timeLeft: state.timeLeft,
    isAnswered: state.isAnswered,
    selectedAnswer: state.selectedAnswer,
    isCorrect: state.isCorrect,
    isFinished: state.isFinished,
    answers: state.answers,
    questions: state.questions,
    selectAnswer,
    goToNextQuestion,
  };
}