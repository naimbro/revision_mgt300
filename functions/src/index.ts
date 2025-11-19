import * as functions from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

// ----------------------------
// Inicialización segura de Admin SDK / Firestore
// ----------------------------

let appInitialized = false;

function initApp() {
  if (!appInitialized) {
    admin.initializeApp();
    appInitialized = true;
  }
}

function getDb() {
  initApp();
  return admin.firestore();
}

// ----------------------------
// Utilidad: obtener API key de OpenAI de forma segura
// ----------------------------

function getOpenAIKey(): string {
  // 1) Primero intentamos con variables de entorno (recomendado en v7)
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== "") {
    return process.env.OPENAI_API_KEY.trim();
  }

  // 2) Intentamos compat con functions.config() SI existe
  try {
    const anyFunctions: any = functions as any;
    if (typeof anyFunctions.config === "function") {
      const cfg = anyFunctions.config();
      if (cfg?.openai?.key && typeof cfg.openai.key === "string") {
        return cfg.openai.key;
      }
    }
  } catch (e) {
    // No hacemos nada: en deploy / discovery puede no estar disponible
  }

  // 3) Fallback: sin clave -> devolvemos string vacío (el caller maneja el error)
  return "";
}

// ----------------------------
// Tipo para jueces
// ----------------------------

interface Judge {
  name: string;
  role: string;
  prompt: string;
}

// ----------------------------
// Definición de jueces (lazy: sólo se construyen cuando se llaman)
// ----------------------------

function getJudges(): Judge[] {
  return [
    {
      name: "Profe Naim",
      role: "Evaluador conceptual y de profundidad",
      prompt: `Eres "Profe Naim", profesor de MGT300. Evalúas profundidad conceptual, rigor teórico y uso coherente de autores (Aghion, Acemoglu & Robinson, Steffen, Sen).

IMPORTANTE: Usa la 'respuesta ideal' asociada a esta pregunta como gold standard interno para calibrar tu evaluación. No la cites ni la muestres al estudiante. Solo úsala como referencia de calidad esperada.

Evalúa:
1. Corrección del concepto central (destrucción creativa, instituciones inclusivas/extractivas, Great Gatsby Curve, Gran Aceleración, etc.)
2. Si conecta el concepto con ideas clave del autor correspondiente
3. Si evita clichés y muestra comprensión del mecanismo causal
4. Calidad del argumento en relación con lo discutido en clase

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "score": número entre 0 y 100,
  "feedback": "máximo 5 líneas, enfatiza precisión conceptual y cómo mejorarla",
  "tags": ["concepto1", "concepto2", "concepto3"]
}`
    },
    {
      name: "Ayudante Mariela",
      role: "Claridad, estructura y redacción",
      prompt: `Eres "Ayudante Mariela", enfocada en claridad, estructura argumental y legibilidad.

IMPORTANTE: Usa la 'respuesta ideal' como referencia interna de claridad y estructura deseada. No la reveles ni la cites directamente.

Evalúas:
1. Si presenta una idea central clara desde el inicio
2. Si las ideas siguen flujo lógico (causa → consecuencia → ejemplo)
3. Si los ejemplos ayudan a entender, no solo adornan
4. Legibilidad global (no corrijas ortografía fina)

Ofrece acciones concretas para mejorar orden y claridad.

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "score": número entre 0 y 100,
  "feedback": "máximo 5 líneas, indicando cómo mejorar orden y claridad con acciones concretas",
  "tags": ["claridad", "estructura", "ejemplificación"]
}`
    },
    {
      name: "Ayudante Carlos",
      role: "Rigor y conexión con el curso",
      prompt: `Eres "Ayudante Carlos", evaluador de rigor, uso preciso de conceptos y alineación con la literatura del curso.

IMPORTANTE: Usa la 'respuesta ideal' para calibrar rigor conceptual. No la muestres ni la nombres directamente.

Evalúas:
1. Aplicación correcta de conceptos centrales: instituciones, incentivos, desigualdad, movilidad, innovación, Antropoceno
2. Identificación de mecanismos causales (ej: incumbentes frenan innovación por riesgo de canibalización; instituciones extractivas reducen incentivos)
3. Conexión explícita con discusiones de clase o lecturas
4. Si evita simplificaciones excesivas

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "score": número entre 0 y 100,
  "feedback": "máximo 5 líneas, señalando rigor conceptual y mecanismos faltantes",
  "tags": ["rigor", "mecanismos", "instituciones"]
}`
    },
    {
      name: "Ayudante Max",
      role: "Especialista en síntesis creativa",
      prompt: `Eres "Ayudante Max", especialista en síntesis creativa.

IMPORTANTE: Usa la 'respuesta ideal' solo como punto de referencia mínima; tú evalúas creatividad adicional que vaya más allá del estándar. No la reveles directamente.

Evalúas:
1. Conexiones conceptuales inesperadas pero correctas (ej: Gran Aceleración + instituciones extractivas + incentivos a innovación verde)
2. Integración de ideas de distintos autores y campos
3. Pensamiento lateral sin inventar evidencia
4. Patrones transversales (poder, incentivos, desigualdad, tecnología)

Premia originalidad fundamentada. No alucines.

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "score": número entre 0 y 100,
  "feedback": "máximo 5 líneas, destacando conexiones potentes o sugerencias para ampliarlas",
  "tags": ["síntesis", "originalidad", "conexiones"]
}`
    }
  ];
}

// ----------------------------
// Llamada a OpenAI para evaluación de una respuesta
// ----------------------------

async function callOpenAI(
  prompt: string,
  answer: string,
  questionText: string,
  idealAnswer?: string
): Promise<any> {
  const apiKey = getOpenAIKey();

  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  // Construir el contenido del usuario con respuesta ideal si existe
  let userContent = `Pregunta: ${questionText}\n\nRespuesta del estudiante: ${answer}`;

  if (idealAnswer) {
    userContent += `\n\nRespuesta ideal (para referencia interna, NO la reveles ni la cites directamente): ${idealAnswer}`;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data: any = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

// ----------------------------
// Cloud Function: Evaluar respuesta con los 4 jueces
// ----------------------------

export const evaluateAnswer = onCall(
  { secrets: ["OPENAI_API_KEY"] },
  async (request) => {
    // Inicializar app y Firestore de forma segura
    const db = getDb();

    // Verificar autenticación
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { gameCode, roundNumber, playerId, answer, questionText, idealAnswer } =
      request.data || {};

    if (!gameCode || !roundNumber || !playerId || !answer || !questionText) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required parameters"
      );
    }

    try {
      // Evaluar con cada juez
      const feedbacks = await Promise.all(
        getJudges().map(async (judge) => {
          try {
            const result = await callOpenAI(
              judge.prompt,
              answer,
              questionText,
              idealAnswer
            );
            return {
              judgeName: judge.name,
              judgeRole: judge.role,
              score: result.score || 0,
              feedback: result.feedback || "No se pudo generar feedback",
              tags: result.tags || [],
            };
          } catch (error) {
            console.error(`Error evaluating with ${judge.name}:`, error);
            // Fallback en caso de error
            return {
              judgeName: judge.name,
              judgeRole: judge.role,
              score: 50,
              feedback: "Error al evaluar. Por favor contacta al profesor.",
              tags: [],
            };
          }
        })
      );

      // Calcular promedio
      const averageScore =
        feedbacks.reduce((sum, f) => sum + (f.score || 0), 0) /
        feedbacks.length;

      // Guardar en Firestore
      await db.doc(`games/${gameCode}`).update({
        [`rounds.${roundNumber}.submissions.${playerId}.feedbacks`]: feedbacks,
        [`rounds.${roundNumber}.submissions.${playerId}.averageScore`]:
          averageScore,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        feedbacks,
        averageScore,
      };
    } catch (error: any) {
      console.error("Error in evaluateAnswer:", error);
      throw new HttpsError(
        "internal",
        error?.message || "Error evaluating answer"
      );
    }
  }
);

// ----------------------------
// Cloud Function: Generar informe personalizado para un estudiante
// ----------------------------

export const generateReport = onCall(
  { secrets: ["OPENAI_API_KEY"] },
  async (request) => {
    const db = getDb();

    // Verificar autenticación
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { gameCode, playerId } = request.data || {};

    if (!gameCode || !playerId) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required parameters"
      );
    }

    try {
      // Obtener datos del juego
      const gameDoc = await db.doc(`games/${gameCode}`).get();
      if (!gameDoc.exists) {
        throw new Error("Game not found");
      }

      const game: any = gameDoc.data();
      if (!game) {
        throw new Error("Game data is empty");
      }

      const player = game.players?.[playerId];
      if (!player) {
        throw new Error("Player not found");
      }

      // Recolectar todos los feedbacks del jugador
      const allFeedbacks: any[] = [];

      Object.keys(game.rounds || {}).forEach((roundNum) => {
        const round = game.rounds[roundNum];
        const submission = round?.submissions?.[playerId];

        if (submission && submission.feedbacks) {
          allFeedbacks.push(...submission.feedbacks);
        }
      });

      // Extraer conceptos más mencionados
      const tagCounts: Record<string, number> = {};
      allFeedbacks.forEach((feedback) => {
        (feedback.tags || []).forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([tag]) => tag);

      const strongConcepts = sortedTags.slice(0, 5);
      const weakConcepts = sortedTags.slice(-3);

      // Generar recomendaciones con OpenAI (si hay API key)
      const apiKey = getOpenAIKey();
      let recommendations: string[] = [];

      if (apiKey) {
        try {
          const recommendationPrompt = `Eres un asistente educativo de MGT300. Genera recomendaciones de estudio personalizadas y accionables para la Unidad 2 (Instituciones, Desigualdad, Innovación, Antropoceno).

Conceptos fuertes: ${strongConcepts.join(", ")}
Conceptos débiles: ${weakConcepts.join(", ")}
Puntaje promedio: ${player.totalScore}

Genera 3-5 recomendaciones que sean:
1. Concretas (ej: "Revisa el mecanismo X en el capítulo Y de Acemoglu")
2. Usen conceptos fuertes para apoyar los débiles (ej: "Como dominas destrucción creativa, úsala para entender por qué las instituciones extractivas bloquean innovación")
3. Muestren acciones específicas (practicar un tipo de pregunta, hacer mapa causal, leer sección puntual, comparar casos)
4. Refieran explícitamente ideas clave del curso (coyunturas críticas, incentivos, incumbentes, Great Gatsby Curve, tecnologías limpias, Gran Aceleración)

Devuelve SOLO un objeto JSON con:
{
  "recommendations": ["recomendación 1", "recomendación 2", "recomendación 3"]
}`;

          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                  { role: "system", content: "Eres un asistente educativo experto." },
                  { role: "user", content: recommendationPrompt },
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 400,
              }),
            }
          );

          if (response.ok) {
            const result: any = await response.json();
            const parsed = JSON.parse(result.choices[0].message.content);
            recommendations = parsed.recommendations || [];
          }
        } catch (error) {
          console.error("Error generating recommendations:", error);
        }
      }

      // Si no se generaron recomendaciones, usar fallback
      if (recommendations.length === 0) {
        recommendations = [
          "Revisa los conceptos fundamentales de los temas con menor puntaje",
          "Practica conectar teoría con ejemplos empíricos",
          "Profundiza en el análisis institucional-político",
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
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      return report;
    } catch (error: any) {
      console.error("Error in generateReport:", error);
      throw new HttpsError(
        "internal",
        error?.message || "Error generating report"
      );
    }
  }
);
