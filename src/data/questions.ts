import { Question } from '../types/game';

export const questions: Question[] = [
  // Tema A: Destrucción creativa e innovación (Aghion)
  {
    id: 1,
    category: 'Destrucción Creativa e Innovación',
    theme: 'A',
    text: 'Explica cómo la destrucción creativa impulsa el crecimiento económico.',
    expectedConcepts: ['innovación', 'competencia', 'productividad', 'schumpeter', 'crecimiento'],
    difficulty: 'medium',
    idealAnswer: 'La destrucción creativa impulsa el crecimiento porque nuevas tecnologías reemplazan a las antiguas, elevando la productividad y generando sectores enteros más eficientes. Siguiendo a Aghion et al., este proceso ocurre cuando innovadores desplazaban a incumbentes, lo que genera ciclos de reemplazo tecnológico que permiten producir más con menos recursos. Aunque destruye empleos y empresas viejas en el corto plazo, en el largo plazo aumenta el ingreso por trabajador gracias a mayor productividad, nuevos mercados y nuevas tareas humanas complementarias a la tecnología.'
  },
  {
    id: 2,
    category: 'Destrucción Creativa e Innovación',
    theme: 'A',
    text: '¿Por qué las empresas incumbentes pueden frenar la innovación? Da un ejemplo.',
    expectedConcepts: ['incumbentes', 'barreras', 'competencia', 'incentivos', 'regulación'],
    difficulty: 'medium',
    idealAnswer: 'Los incumbentes frenan innovación porque tienen incentivos a proteger sus rentas existentes: una tecnología nueva puede canibalizar sus productos o reducir su poder de mercado. Aghion muestra que mientras las firmas cercanas a la frontera tecnológica innovan más para escapar la competencia, las dominantes prefieren bloquear tecnologías disruptivas. Ejemplo: fabricantes tradicionales de autos invirtieron por décadas en motores de combustión y demoraron la transición hacia autos eléctricos, incluso cuando la evidencia mostraba que la innovación verde era necesaria.'
  },
  {
    id: 3,
    category: 'Destrucción Creativa e Innovación',
    theme: 'A',
    text: '¿Qué papel juegan las políticas públicas para orientar la innovación hacia tecnologías limpias?',
    expectedConcepts: ['política pública', 'innovación', 'tecnologías limpias', 'incentivos', 'subsidios'],
    difficulty: 'hard',
    idealAnswer: 'Las políticas públicas corrigen el sesgo natural hacia tecnologías contaminantes cuando la trayectoria histórica (path dependence) hace difícil cambiar de rumbo. Aghion explica que, sin incentivos, las empresas siguen innovando donde ya tienen capacidades: motores a combustión, procesos intensivos en carbono, etc. El Estado puede redirigir la innovación mediante impuestos al carbono, subsidios a I+D verde y regulación que acelere la adopción de tecnologías limpias. Esto permite romper trayectorias contaminantes y generar un círculo virtuoso de innovación verde y crecimiento sostenible.'
  },

  // Tema B: Desigualdad y movilidad social (Atkinson, Piketty, Saez)
  {
    id: 4,
    category: 'Desigualdad y Movilidad Social',
    theme: 'B',
    text: '¿Por qué es importante distinguir entre desigualdad general y desigualdad en la cima (top 1%)?',
    expectedConcepts: ['desigualdad', 'top 1%', 'distribución', 'riqueza', 'ingreso'],
    difficulty: 'medium',
    idealAnswer: 'La desigualdad general describe la distribución completa del ingreso (medida por Gini), mientras que la desigualdad en la cima se enfoca en cuánta renta captura el 1% más rico. Aghion et al. muestran que estas dos desigualdades responden a mecanismos distintos: la desigualdad en la cima suele crecer con innovaciones radicales y mercados ganadores–se-lo-llevan-todo, mientras que la desigualdad general también refleja salarios, educación y movilidad. Distinguirlas importa para diseñar políticas: impuestos progresivos para el top 1%, educación y movilidad para reducir desigualdad general.'
  },
  {
    id: 5,
    category: 'Desigualdad y Movilidad Social',
    theme: 'B',
    text: 'Explica qué representa la "Great Gatsby Curve" y qué implica para las políticas públicas.',
    expectedConcepts: ['movilidad social', 'desigualdad', 'intergeneracional', 'política pública', 'oportunidad'],
    difficulty: 'hard',
    idealAnswer: 'La Great Gatsby Curve muestra que los países con mayor desigualdad de ingresos tienen menor movilidad intergeneracional. Es decir, donde la distribución está muy concentrada, el origen familiar determina más el futuro económico. Aghion y Chetty encuentran que esta relación refleja desigualdad en acceso a buena educación, redes y oportunidades. En política pública implica que reducir desigualdad no es solo redistribución: también requiere inversión en movilidad (educación temprana, barrios integrados, salud, meritocracia real).'
  },
  {
    id: 6,
    category: 'Desigualdad y Movilidad Social',
    theme: 'B',
    text: '¿Cómo puede la innovación tecnológica contribuir tanto al aumento como a la reducción de la desigualdad?',
    expectedConcepts: ['tecnología', 'desigualdad', 'trabajo', 'capital humano', 'educación'],
    difficulty: 'hard',
    idealAnswer: 'La innovación puede aumentar la desigualdad cuando genera "superestrellas" o automatiza tareas complementarias al trabajo de menor calificación, elevando la prima salarial para habilidades avanzadas. A la vez, puede reducir desigualdad si impulsa crecimiento inclusivo: abarata bienes, crea nuevos tipos de trabajo y permite políticas redistributivas más efectivas. Aghion señala que el efecto final depende de instituciones, competencia y políticas: los mismos avances tecnológicos pueden producir desigualdad extrema o movilidad ascendente, según el marco institucional.'
  },

  // Tema C: Instituciones y desarrollo (Acemoglu & Robinson)
  {
    id: 7,
    category: 'Instituciones y Desarrollo',
    theme: 'C',
    text: 'Explica la diferencia entre instituciones inclusivas y extractivas.',
    expectedConcepts: ['instituciones', 'inclusivas', 'extractivas', 'desarrollo', 'poder'],
    difficulty: 'easy',
    idealAnswer: 'Para Acemoglu y Robinson, las instituciones inclusivas generan incentivos a invertir, educarse e innovar porque garantizan propiedad privada, Estado de derecho, competencia y participación amplia. Las extractivas concentran poder económico y político en élites que extraen recursos de la mayoría, desincentivando el esfuerzo y matando la innovación. Las inclusivas permiten crecimiento sostenido; las extractivas pueden generar crecimiento corto basado en coerción pero terminan estancándose.'
  },
  {
    id: 8,
    category: 'Instituciones y Desarrollo',
    theme: 'C',
    text: '¿Qué es una "coyuntura crítica" y cómo afecta trayectorias institucionales?',
    expectedConcepts: ['coyuntura crítica', 'instituciones', 'cambio', 'trayectoria', 'historia'],
    difficulty: 'hard',
    idealAnswer: 'Una coyuntura crítica es un shock (guerra, crisis, colonización, transición tecnológica) que abre oportunidades para cambiar instituciones. Según Acemoglu y Robinson, en esos momentos pequeños cambios pueden generar trayectorias divergentes persistentes: instituciones inclusivas pueden emerger o consolidarse, o pueden reforzarse instituciones extractivas. La historia importa porque después de la coyuntura se cierran las alternativas: las instituciones creadas generan un camino auto-reforzado.'
  },

  // Tema D: Antropoceno y sostenibilidad (Steffen)
  {
    id: 9,
    category: 'Antropoceno y Sostenibilidad',
    theme: 'D',
    text: '¿Qué es la "Gran Aceleración" y cómo se relaciona con el sistema económico actual?',
    expectedConcepts: ['gran aceleración', 'antropoceno', 'economía', 'sostenibilidad', 'recursos'],
    difficulty: 'medium',
    idealAnswer: 'La Gran Aceleración describe el aumento abrupto desde 1950 en indicadores socioeconómicos (PIB, energía, transporte, consumo) y biofísicos (CO₂, biodiversidad, temperatura, ciclos biogeoquímicos). Steffen et al. muestran que este crecimiento masivo está ligado al modelo económico industrial basado en combustibles fósiles, extracción intensiva y producción masiva. El sistema económico actual depende de esta aceleración, pero también la intensifica, creando una crisis planetaria sin precedentes.'
  },
  {
    id: 10,
    category: 'Antropoceno y Sostenibilidad',
    theme: 'D',
    text: '¿Cómo pueden las instituciones orientar la economía hacia trayectorias sostenibles?',
    expectedConcepts: ['instituciones', 'sostenibilidad', 'economía', 'política pública', 'transición'],
    difficulty: 'hard',
    idealAnswer: 'Las instituciones pueden cambiar incentivos y reducir el sesgo hacia tecnologías contaminantes mediante marcos regulatorios, impuestos ambientales, subsidios a innovación verde y normas de transición energética. Aghion y Steffen muestran que las dinámicas económicas están influenciadas por reglas e incentivos: si las instituciones penalizan el carbono e impulsan la innovación limpia, las firmas cambian su ruta tecnológica. Instituciones fuertes permiten coordinar inversiones de largo plazo y superar problemas de acción colectiva.'
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
