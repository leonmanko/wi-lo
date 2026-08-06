// apps/web/src/data/mockQuizQuestions.ts

export interface MockQuestion {
  id: string;
  questionText: string;
  answers: { text: string; isCorrect: boolean }[];
  media?: {
    type: 'image' | 'audio';
    url: string;
  };
}

const footballQuestions: MockQuestion[] = [
  {
    id: 'f1',
    questionText: 'Qui a remporté la Coupe du Monde 2018 ?',
    answers: [
      { text: 'France', isCorrect: true },
      { text: 'Croatie', isCorrect: false },
      { text: 'Brésil', isCorrect: false },
      { text: 'Allemagne', isCorrect: false },
    ],
  },
  {
    id: 'f2',
    questionText: 'Quel joueur détient le record de Ballons d\'Or ?',
    answers: [
      { text: 'Lionel Messi', isCorrect: true },
      { text: 'Cristiano Ronaldo', isCorrect: false },
      { text: 'Pelé', isCorrect: false },
      { text: 'Diego Maradona', isCorrect: false },
    ],
    media: {
      type: 'image',
      url: 'https://picsum.photos/400/200?random=1',
    },
  },
  {
    id: 'f3',
    questionText: 'Quel club a gagné le plus de Ligues des Champions ?',
    answers: [
      { text: 'Real Madrid', isCorrect: true },
      { text: 'FC Barcelone', isCorrect: false },
      { text: 'Bayern Munich', isCorrect: false },
      { text: 'AC Milan', isCorrect: false },
    ],
    media: {
      type: 'audio',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
  },
];

const basketballQuestions: MockQuestion[] = [
  {
    id: 'b1',
    questionText: 'Quelle équipe a remporté le plus de titres NBA ?',
    answers: [
      { text: 'Boston Celtics', isCorrect: true },
      { text: 'Los Angeles Lakers', isCorrect: false },
      { text: 'Chicago Bulls', isCorrect: false },
      { text: 'Golden State Warriors', isCorrect: false },
    ],
    media: {
      type: 'image',
      url: 'https://picsum.photos/400/200?random=2',
    },
  },
  {
    id: 'b2',
    questionText: 'Qui est le meilleur marqueur de l\'histoire de la NBA ?',
    answers: [
      { text: 'LeBron James', isCorrect: true },
      { text: 'Kareem Abdul-Jabbar', isCorrect: false },
      { text: 'Michael Jordan', isCorrect: false },
      { text: 'Kobe Bryant', isCorrect: false },
    ],
    media: {
      type: 'audio',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
  },
];

const tennisQuestions: MockQuestion[] = [
  {
    id: 't1',
    questionText: 'Qui a gagné le plus de titres du Grand Chelem ?',
    answers: [
      { text: 'Novak Djokovic', isCorrect: true },
      { text: 'Rafael Nadal', isCorrect: false },
      { text: 'Roger Federer', isCorrect: false },
      { text: 'Pete Sampras', isCorrect: false },
    ],
  },
  {
    id: 't2',
    questionText: 'Quel tournoi se joue sur gazon ?',
    answers: [
      { text: 'Wimbledon', isCorrect: true },
      { text: 'Roland-Garros', isCorrect: false },
      { text: 'US Open', isCorrect: false },
      { text: 'Australian Open', isCorrect: false },
    ],
    media: {
      type: 'image',
      url: 'https://picsum.photos/400/200?random=3',
    },
  },
];

const allQuestions: Record<string, MockQuestion[]> = {
  football: footballQuestions,
  basketball: basketballQuestions,
  tennis: tennisQuestions,
};

export function getMockQuestions(sport: string, count: number): MockQuestion[] {
  const pool = allQuestions[sport] || footballQuestions;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}