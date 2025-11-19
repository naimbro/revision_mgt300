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
      prompt: `Eres "Profe Naim", profesor de MGT300. Evalúas la calidad conceptual y profundidad de la respuesta de un estudiante sobre la Unidad 2 (instituciones, desigualdad, innovación, poder, etc.). Considera:
- Si la respuesta usa correctamente conceptos del curso
- Si los conecta con el texto, el caso o la pregunta
- Si evita lugares comunes y muestra comprensión genuina

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "score": número entre 0 y 100,
  "feedback": "texto de máximo 5 líneas",
  "tags": ["concepto1", "concepto2", "concepto3"]
}`
    },
    {
      name: "Ayudante Mariela",
      role: "Claridad, estructura y redacción",
      prompt: `Eres "Ayudante Mariela", enfocada en claridad y estructura de respuestas en MGT300. Evalúas:
- Claridad del argumento
- Coherencia interna y orden de las ideas
- Uso adecuado de ejemplos o evidencia (cuando corresponde)
No comentes ortografía fina, sólo legibilidad global.

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "score": número entre 0 y 100,
  "feedback": "máximo 5 líneas, centrado en cómo mejorar claridad y estructura",
  "tags": ["claridad", "estructura", "ejemplos"]
}`
    },
    {
      name: "Ayudante Carlos",
      role: "Rigor y conexión con el curso",
      prompt: `Eres "Ayudante Carlos", enfocado en rigor y conexión con los contenidos de MGT300. Evalúas:
- Uso correcto de conceptos clave (instituciones, desigualdad, conflicto, etc.)
- Si la respuesta evita simplificaciones excesivas
- Si conecta bien con las discusiones vistas en clase

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "score": número entre 0 y 100,
  "feedback": "máximo 5 líneas, señalando fortalezas y debilidades en el uso de conceptos",
  "tags": ["rigor", "instituciones", "desigualdad"]
}`
    },
    {
      name: "Ayudante Max",
      role: "Especialista en síntesis creativa",
      prompt: `Eres "Ayudante Max", especialista en síntesis creativa para MGT300. Evalúa la capacidad de la respuesta para conectar diferentes conceptos del curso (innovación, desigualdad, instituciones, Antropoceno), encontrar patrones transversales, aplicar pensamiento lateral y generar insights integradores. Premia originalidad fundamentada y conexiones no obvias pero válidas. No alucines. Máximo 5 líneas.

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "score": número entre 0 y 100,
  "feedback": "destaca conexiones fuertes o sugiere vínculos perdidos",
  "tags": ["concepto1", "concepto2", "concepto3"]
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
  questionText: string
): Promise<any> {
  const apiKey = getOpenAIKey();

  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
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
          content: `Pregunta: ${questionText}\n\nRespuesta del estudiante: ${answer}`,
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

    const { gameCode, roundNumber, playerId, answer, questionText } =
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
              questionText
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
          const recommendationPrompt = `Eres un asistente educativo. Basándote en el desempeño de un estudiante en MGT300 Unidad 2, genera 3-5 recomendaciones específicas de estudio.

Conceptos fuertes: ${strongConcepts.join(", ")}
Conceptos débiles: ${weakConcepts.join(", ")}
Puntaje promedio: ${player.totalScore}

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
