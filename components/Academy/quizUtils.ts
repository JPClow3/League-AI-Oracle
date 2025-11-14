export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation: string;
}

export const generateQuizQuestions = (_lessonContent: string, lessonTopic: string): QuizQuestion[] => {
  const genericQuestions: QuizQuestion[] = [
    {
      question: `Based on the lesson "${lessonTopic}", what is the most important factor to consider?`,
      options: [
        'Champion mechanics and skill expression',
        'Understanding the strategic context and game state',
        'Individual player skill ratings',
        'Random chance and luck',
      ],
      correctAnswer: 1,
      explanation: 'Strategic understanding of game context is crucial for applying any League concept effectively.',
    },
    {
      question: 'When should you apply the concepts from this lesson?',
      options: [
        'Only in ranked games',
        'Throughout the entire game when relevant',
        'Only during the late game',
        'Only when you are ahead',
      ],
      correctAnswer: 1,
      explanation: 'Most strategic concepts are applicable throughout the game when the situation calls for them.',
    },
    {
      question: 'What is the key to improving at League of Legends?',
      options: [
        'Playing as many games as possible',
        'Blaming teammates for mistakes',
        'Understanding concepts and applying them consistently',
        'Only playing meta champions',
      ],
      correctAnswer: 2,
      explanation: 'Consistent application of strategic concepts leads to long-term improvement.',
    },
  ];

  return genericQuestions;
};
