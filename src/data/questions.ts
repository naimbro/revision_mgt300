import { Question } from '../types/game';

export const questions: Question[] = [
  // Tema A: Destrucción creativa e innovación (Aghion)
  {
    id: 1,
    category: 'Destrucción Creativa e Innovación',
    theme: 'A',
    text: 'Explica cómo la destrucción creativa impulsa el crecimiento económico.',
    expectedConcepts: ['innovación', 'competencia', 'productividad', 'schumpeter', 'crecimiento'],
    difficulty: 'medium'
  },
  {
    id: 2,
    category: 'Destrucción Creativa e Innovación',
    theme: 'A',
    text: '¿Por qué las empresas incumbentes pueden frenar la innovación? Da un ejemplo.',
    expectedConcepts: ['incumbentes', 'barreras', 'competencia', 'incentivos', 'regulación'],
    difficulty: 'medium'
  },
  {
    id: 3,
    category: 'Destrucción Creativa e Innovación',
    theme: 'A',
    text: '¿Qué papel juegan las políticas públicas para orientar la innovación hacia tecnologías limpias?',
    expectedConcepts: ['política pública', 'innovación', 'tecnologías limpias', 'incentivos', 'subsidios'],
    difficulty: 'hard'
  },

  // Tema B: Desigualdad y movilidad social (Atkinson, Piketty, Saez)
  {
    id: 4,
    category: 'Desigualdad y Movilidad Social',
    theme: 'B',
    text: '¿Por qué es importante distinguir entre desigualdad general y desigualdad en la cima (top 1%)?',
    expectedConcepts: ['desigualdad', 'top 1%', 'distribución', 'riqueza', 'ingreso'],
    difficulty: 'medium'
  },
  {
    id: 5,
    category: 'Desigualdad y Movilidad Social',
    theme: 'B',
    text: 'Explica qué representa la "Great Gatsby Curve" y qué implica para las políticas públicas.',
    expectedConcepts: ['movilidad social', 'desigualdad', 'intergeneracional', 'política pública', 'oportunidad'],
    difficulty: 'hard'
  },
  {
    id: 6,
    category: 'Desigualdad y Movilidad Social',
    theme: 'B',
    text: '¿Cómo puede la innovación tecnológica contribuir tanto al aumento como a la reducción de la desigualdad?',
    expectedConcepts: ['tecnología', 'desigualdad', 'trabajo', 'capital humano', 'educación'],
    difficulty: 'hard'
  },

  // Tema C: Instituciones y desarrollo (Acemoglu & Robinson)
  {
    id: 7,
    category: 'Instituciones y Desarrollo',
    theme: 'C',
    text: 'Explica la diferencia entre instituciones inclusivas y extractivas.',
    expectedConcepts: ['instituciones', 'inclusivas', 'extractivas', 'desarrollo', 'poder'],
    difficulty: 'easy'
  },
  {
    id: 8,
    category: 'Instituciones y Desarrollo',
    theme: 'C',
    text: '¿Qué es una "coyuntura crítica" y cómo afecta trayectorias institucionales?',
    expectedConcepts: ['coyuntura crítica', 'instituciones', 'cambio', 'trayectoria', 'historia'],
    difficulty: 'hard'
  },

  // Tema D: Antropoceno y sostenibilidad (Steffen)
  {
    id: 9,
    category: 'Antropoceno y Sostenibilidad',
    theme: 'D',
    text: '¿Qué es la "Gran Aceleración" y cómo se relaciona con el sistema económico actual?',
    expectedConcepts: ['gran aceleración', 'antropoceno', 'economía', 'sostenibilidad', 'recursos'],
    difficulty: 'medium'
  },
  {
    id: 10,
    category: 'Antropoceno y Sostenibilidad',
    theme: 'D',
    text: '¿Cómo pueden las instituciones orientar la economía hacia trayectorias sostenibles?',
    expectedConcepts: ['instituciones', 'sostenibilidad', 'economía', 'política pública', 'transición'],
    difficulty: 'hard'
  }
];

export const TOTAL_ROUNDS = questions.length;

// Función helper para obtener pregunta por ID
export const getQuestionById = (id: number): Question | undefined => {
  return questions.find(q => q.id === id);
};

// Función helper para obtener preguntas por tema
export const getQuestionsByTheme = (theme: 'A' | 'B' | 'C' | 'D'): Question[] => {
  return questions.filter(q => q.theme === theme);
};
