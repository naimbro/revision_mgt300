import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Obtener API key de OpenAI desde Firebase config
const getOpenAIKey = (): string => {
  const config = functions.config();
  return config.openai?.key || '';
};

// Definición de jueces
const judges = [
  {
    name: 'Profe Naim',
    role: 'Digital Twin del Profesor',
    prompt: `Eres "Profe Naim", el digital twin del profesor de MGT300. Evalúa la respuesta de un estudiante a una pregunta del Módulo 2. El foco es: claridad causal, rigor conceptual, mecanismos económicos/sociales, precisión y ausencia de vaguedades. Responde en máximo 5 líneas. No alucines; usa solo el contenido del curso y la lógica interna.

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "score": número entre 0 y 100,
  "feedback": "texto de máximo 5 líneas",
  "tags": ["concepto1", "concepto2", "concepto3"]
}`
  },
  {
    name: 'Ayudante Mariela',
    role: 'Especialista en Evidencia Empírica',
    prompt: `Eres "Ayudante Mariela", enfocada en evidencia cuantitativa del curso MGT300. Evalúa si la respuesta incorpora o entiende datos, ejemplos reales, patrones empíricos o resultados de investigaciones relevantes sobre innovación, desigualdad, instituciones o Antropoceno. Responde en máximo 5 líneas, sin alucinar. Usa solo hechos conocidos o inferencias directas del contenido del curso.

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "score": número entre 0 y 100,
  "feedback": "texto de máximo 5 líneas",
  "tags": ["concepto1", "concepto2", "concepto3"]
}`
  },
  {
    name: 'Ayudante Carlos',
    role: 'Experto Institucional-Político',
    prompt: `Eres "Ayudante Carlos", especializado en análisis institucional-político en MGT300. Evalúa la respuesta según su capacidad de conectar la pregunta con instituciones inclusivas/extractivas, distribución de poder, historia, incentivos y efectos de largo plazo. No alucines. Máximo 5 líneas.

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "score": número entre 0 y 100,
  "feedback": "texto de máximo 5 líneas",
  "tags": ["concepto1", "concepto2", "concepto3"]
}`
  }
];

// Llamar a OpenAI para evaluación
async function callOpenAI(prompt: string, answer: string, questionText: string): Promise<any> {
  // Import fetch dynamically to avoid timeout during code analysis
  const fetch = (await import('node-fetch')).default;

  const apiKey = getOpenAIKey();

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: `Pregunta: ${questionText}\n\nRespuesta del estudiante: ${answer}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data: any = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

// Cloud Function: Evaluar respuesta con los 3 jueces
export const evaluateAnswer = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { gameCode, roundNumber, playerId, answer, questionText } = data;

  if (!gameCode || !roundNumber || !playerId || !answer || !questionText) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters'
    );
  }

  try {
    // Evaluar con cada juez
    const feedbacks = await Promise.all(
      judges.map(async (judge) => {
        try {
          const result = await callOpenAI(judge.prompt, answer, questionText);
          return {
            judgeName: judge.name,
            judgeRole: judge.role,
            score: result.score || 0,
            feedback: result.feedback || 'No se pudo generar feedback',
            tags: result.tags || []
          };
        } catch (error) {
          console.error(`Error evaluating with ${judge.name}:`, error);
          // Fallback en caso de error
          return {
            judgeName: judge.name,
            judgeRole: judge.role,
            score: 50,
            feedback: 'Error al evaluar. Por favor contacta al profesor.',
            tags: []
          };
        }
      })
    );

    // Calcular promedio
    const averageScore = feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length;

    // Guardar en Firestore
    await db.doc(`games/${gameCode}`).update({
      [`rounds.${roundNumber}.submissions.${playerId}.feedbacks`]: feedbacks,
      [`rounds.${roundNumber}.submissions.${playerId}.averageScore`]: averageScore,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      feedbacks,
      averageScore
    };
  } catch (error: any) {
    console.error('Error in evaluateAnswer:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Error evaluating answer'
    );
  }
});

// Cloud Function: Generar informe personalizado para un estudiante
export const generateReport = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { gameCode, playerId } = data;

  if (!gameCode || !playerId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters'
    );
  }

  try {
    // Obtener datos del juego
    const gameDoc = await db.doc(`games/${gameCode}`).get();
    if (!gameDoc.exists) {
      throw new Error('Game not found');
    }

    const game: any = gameDoc.data();
    if (!game) {
      throw new Error('Game data is empty');
    }

    const player = game.players[playerId];
    if (!player) {
      throw new Error('Player not found');
    }

    // Recolectar todos los feedbacks del jugador
    const allFeedbacks: any[] = [];

    Object.keys(game.rounds).forEach((roundNum) => {
      const round = game.rounds[roundNum];
      const submission = round.submissions[playerId];

      if (submission && submission.feedbacks) {
        allFeedbacks.push(...submission.feedbacks);
      }
    });

    // Extraer conceptos más mencionados
    const tagCounts: any = {};
    allFeedbacks.forEach((feedback) => {
      feedback.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const sortedTags = Object.entries(tagCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .map(([tag]) => tag);

    const strongConcepts = sortedTags.slice(0, 5);
    const weakConcepts = sortedTags.slice(-3);

    // Generar recomendaciones con OpenAI
    const apiKey = getOpenAIKey();
    let recommendations: string[] = [];

    if (apiKey) {
      try {
        // Import fetch dynamically to avoid timeout during code analysis
        const fetch = (await import('node-fetch')).default;

        const recommendationPrompt = `Eres un asistente educativo. Basándote en el desempeño de un estudiante en MGT300 Unidad 2, genera 3-5 recomendaciones específicas de estudio.

Conceptos fuertes: ${strongConcepts.join(', ')}
Conceptos débiles: ${weakConcepts.join(', ')}
Puntaje promedio: ${player.totalScore}

Devuelve SOLO un objeto JSON con:
{
  "recommendations": ["recomendación 1", "recomendación 2", "recomendación 3"]
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Eres un asistente educativo experto.' },
              { role: 'user', content: recommendationPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 400
          })
        });

        if (response.ok) {
          const result: any = await response.json();
          const parsed = JSON.parse(result.choices[0].message.content);
          recommendations = parsed.recommendations || [];
        }
      } catch (error) {
        console.error('Error generating recommendations:', error);
      }
    }

    // Si no se generaron recomendaciones, usar fallback
    if (recommendations.length === 0) {
      recommendations = [
        'Revisa los conceptos fundamentales de los temas con menor puntaje',
        'Practica conectar teoría con ejemplos empíricos',
        'Profundiza en el análisis institucional-político'
      ];
    }

    const report = {
      playerId,
      playerName: player.name,
      totalScore: player.totalScore,
      strongConcepts,
      weakConcepts,
      recommendations,
      allFeedbacks,
      generatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return report;
  } catch (error: any) {
    console.error('Error in generateReport:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Error generating report'
    );
  }
});
