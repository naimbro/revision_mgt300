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
    text: '¿De qué manera la competencia afecta los incentivos a innovar?',
    expectedConcepts: ['competencia', 'incentivos', 'monopolio', 'mercado', 'inversión'],
    difficulty: 'medium'
  },
  {
    id: 4,
    category: 'Destrucción Creativa e Innovación',
    theme: 'A',
    text: '¿Cómo puede la innovación aumentar la desigualdad en el corto plazo?',
    expectedConcepts: ['desigualdad', 'innovación', 'distribución', 'trabajo', 'capital'],
    difficulty: 'hard'
  },
  {
    id: 5,
    category: 'Destrucción Creativa e Innovación',
    theme: 'A',
    text: 'Explica la diferencia entre innovación radical y incremental.',
    expectedConcepts: ['radical', 'incremental', 'tecnología', 'proceso', 'producto'],
    difficulty: 'easy'
  },
  {
    id: 6,
    category: 'Destrucción Creativa e Innovación',
    theme: 'A',
    text: '¿Qué papel juegan las políticas públicas para orientar la innovación hacia tecnologías limpias?',
    expectedConcepts: ['política pública', 'innovación', 'tecnologías limpias', 'incentivos', 'subsidios'],
    difficulty: 'hard'
  },

  // Tema B: Desigualdad y movilidad social (Atkinson, Piketty, Saez)
  {
    id: 7,
    category: 'Desigualdad y Movilidad Social',
    theme: 'B',
    text: '¿Por qué es importante distinguir entre desigualdad general y desigualdad en la cima (top 1%)?',
    expectedConcepts: ['desigualdad', 'top 1%', 'distribución', 'riqueza', 'ingreso'],
    difficulty: 'medium'
  },
  {
    id: 8,
    category: 'Desigualdad y Movilidad Social',
    theme: 'B',
    text: 'Explica qué representa la "Great Gatsby Curve" y qué implica para las políticas públicas.',
    expectedConcepts: ['movilidad social', 'desigualdad', 'intergeneracional', 'política pública', 'oportunidad'],
    difficulty: 'hard'
  },
  {
    id: 9,
    category: 'Desigualdad y Movilidad Social',
    theme: 'B',
    text: '¿Cómo puede la innovación tecnológica contribuir tanto al aumento como a la reducción de la desigualdad?',
    expectedConcepts: ['tecnología', 'desigualdad', 'trabajo', 'capital humano', 'educación'],
    difficulty: 'hard'
  },
  {
    id: 10,
    category: 'Desigualdad y Movilidad Social',
    theme: 'B',
    text: '¿Por qué la movilidad intergeneracional es central para evaluar una sociedad justa?',
    expectedConcepts: ['movilidad', 'intergeneracional', 'justicia', 'oportunidad', 'igualdad'],
    difficulty: 'medium'
  },

  // Tema C: Instituciones y desarrollo (Acemoglu & Robinson)
  {
    id: 11,
    category: 'Instituciones y Desarrollo',
    theme: 'C',
    text: 'Explica la diferencia entre instituciones inclusivas y extractivas.',
    expectedConcepts: ['instituciones', 'inclusivas', 'extractivas', 'desarrollo', 'poder'],
    difficulty: 'easy'
  },
  {
    id: 12,
    category: 'Instituciones y Desarrollo',
    theme: 'C',
    text: '¿Cómo pueden dos países con condiciones iniciales similares divergir radicalmente en desarrollo?',
    expectedConcepts: ['instituciones', 'desarrollo', 'trayectoria', 'divergencia', 'política'],
    difficulty: 'medium'
  },
  {
    id: 13,
    category: 'Instituciones y Desarrollo',
    theme: 'C',
    text: '¿Qué es una "coyuntura crítica" y cómo afecta trayectorias institucionales?',
    expectedConcepts: ['coyuntura crítica', 'instituciones', 'cambio', 'trayectoria', 'historia'],
    difficulty: 'hard'
  },
  {
    id: 14,
    category: 'Instituciones y Desarrollo',
    theme: 'C',
    text: 'Explica cómo el caso de las dos Coreas ilustra la importancia de las instituciones.',
    expectedConcepts: ['instituciones', 'coreas', 'desarrollo', 'comparación', 'política'],
    difficulty: 'medium'
  },
  {
    id: 15,
    category: 'Instituciones y Desarrollo',
    theme: 'C',
    text: '¿Por qué la concentración de poder puede frenar el crecimiento a largo plazo?',
    expectedConcepts: ['poder', 'concentración', 'crecimiento', 'instituciones', 'extractivas'],
    difficulty: 'medium'
  },

  // Tema D: Antropoceno y sostenibilidad (Steffen)
  {
    id: 16,
    category: 'Antropoceno y Sostenibilidad',
    theme: 'D',
    text: '¿Qué es la "Gran Aceleración" y cómo se relaciona con el sistema económico actual?',
    expectedConcepts: ['gran aceleración', 'antropoceno', 'economía', 'sostenibilidad', 'recursos'],
    difficulty: 'medium'
  },
  {
    id: 17,
    category: 'Antropoceno y Sostenibilidad',
    theme: 'D',
    text: '¿Por qué el Antropoceno no es solo un fenómeno ambiental, sino también social y económico?',
    expectedConcepts: ['antropoceno', 'social', 'económico', 'ambiental', 'sistema'],
    difficulty: 'hard'
  },
  {
    id: 18,
    category: 'Antropoceno y Sostenibilidad',
    theme: 'D',
    text: 'Explica una evidencia empírica que muestre la magnitud de la presión humana sobre el planeta.',
    expectedConcepts: ['evidencia', 'empírica', 'presión', 'recursos', 'límites planetarios'],
    difficulty: 'medium'
  },
  {
    id: 19,
    category: 'Antropoceno y Sostenibilidad',
    theme: 'D',
    text: '¿Cómo pueden las instituciones orientar la economía hacia trayectorias sostenibles?',
    expectedConcepts: ['instituciones', 'sostenibilidad', 'economía', 'política pública', 'transición'],
    difficulty: 'hard'
  },
  {
    id: 20,
    category: 'Antropoceno y Sostenibilidad',
    theme: 'D',
    text: 'Explica la relación entre crecimiento económico, emisiones y transición energética.',
    expectedConcepts: ['crecimiento', 'emisiones', 'transición energética', 'descarbonización', 'desarrollo'],
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
