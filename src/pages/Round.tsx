import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import { useGame } from '../hooks/useGame';
import { getQuestionById } from '../data/questions';
import { judges } from '../data/judges';
import Timer from '../components/Timer';
import JudgeFeedbackDisplay from '../components/JudgeFeedbackDisplay';
import { Loader, Send, Play, Pause, SkipForward, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const ROUND_DURATION = 5 * 60 * 1000; // 5 minutos por ronda

export default function Round() {
  const { roundNumber } = useParams();
  const navigate = useNavigate();
  const gameCode = localStorage.getItem('gameCode');
  const playerId = localStorage.getItem('playerId');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const { game, loading } = useGame(gameCode);

  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);

  const currentRound = parseInt(roundNumber || '1');
  const round = game?.rounds[currentRound];
  const question = getQuestionById(currentRound);
  const mySubmission = playerId && round ? round.submissions[playerId] : null;

  // Sincronizar navegación
  useEffect(() => {
    if (game?.state === 'results') {
      navigate(`/results/${currentRound}`);
    }
    if (game?.state === 'completed') {
      navigate('/end');
    }
  }, [game?.state, currentRound, navigate]);

  // Verificar si ya envió
  useEffect(() => {
    if (round?.submissions[playerId!]) {
      setHasSubmitted(true);
    }
  }, [round, playerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim() || hasSubmitted || !gameCode || !playerId) return;

    setSubmitting(true);

    try {
      // Guardar respuesta
      await updateDoc(doc(db, 'games', gameCode), {
        [`rounds.${currentRound}.submissions.${playerId}`]: {
          answer: answer.trim(),
          submittedAt: Timestamp.now()
        },
        updatedAt: Timestamp.now()
      });

      // Llamar Cloud Function para evaluar
      const evaluateAnswer = httpsCallable(functions, 'evaluateAnswer');
      await evaluateAnswer({
        gameCode,
        roundNumber: currentRound,
        playerId,
        answer: answer.trim(),
        questionText: question?.text
      });

      setHasSubmitted(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error al enviar respuesta. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePause = async () => {
    if (!gameCode || !isAdmin) return;

    try {
      await updateDoc(doc(db, 'games', gameCode), {
        [`rounds.${currentRound}.isPaused`]: !round?.isPaused,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error toggling pause:', error);
    }
  };

  const handleProcessRound = async () => {
    if (!gameCode || !game || processing) return;

    setProcessing(true);

    try {
      // Calcular scores
      const submissions = round?.submissions || {};
      const players = game.players;

      // Actualizar puntajes totales
      const updates: any = {
        state: 'results',
        updatedAt: Timestamp.now()
      };

      Object.keys(submissions).forEach(pId => {
        const submission = submissions[pId];
        const score = submission.averageScore || 0;
        const currentTotal = players[pId]?.totalScore || 0;

        updates[`players.${pId}.totalScore`] = currentTotal + score;
        updates[`players.${pId}.roundScores.${currentRound}`] = score;
      });

      await updateDoc(doc(db, 'games', gameCode), updates);
    } catch (error) {
      console.error('Error processing round:', error);
      setProcessing(false);
    }
  };

  const handleForceFinish = async () => {
    if (!gameCode || !isAdmin) return;

    const confirm = window.confirm(
      '¿Estás seguro de terminar el juego? Se mostrará el podio final.'
    );

    if (confirm) {
      try {
        await updateDoc(doc(db, 'games', gameCode), {
          state: 'completed',
          updatedAt: Timestamp.now()
        });
      } catch (error) {
        console.error('Error finishing game:', error);
      }
    }
  };

  const handleTimeExpire = useCallback(async () => {
    if (isAdmin && game && gameCode && !processing) {
      await handleProcessRound();
    }
  }, [isAdmin, game, gameCode, processing]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!game || !round || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Error cargando ronda</p>
      </div>
    );
  }

  const endTime = round.startTime instanceof Timestamp
    ? round.startTime.toMillis() + ROUND_DURATION
    : new Date(round.startTime).getTime() + ROUND_DURATION;

  const submittedCount = Object.keys(round.submissions).length;
  const totalPlayers = Object.values(game.players).filter(p => p.isActive && !p.isAdmin).length;
  const allSubmitted = submittedCount >= totalPlayers;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold gradient-text">
              Ronda {currentRound} de {game.totalRounds}
            </h1>
            <Timer
              endTime={endTime}
              onExpire={handleTimeExpire}
              isPaused={round.isPaused}
            />
          </div>

          <div className="dramatic-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-400 font-semibold">
                {question.category}
              </span>
              <span className="text-sm text-gray-400">
                {submittedCount} / {totalPlayers} respondieron
              </span>
            </div>
          </div>
        </motion.div>

        {/* Jueces */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="dramatic-card p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Jueces Evaluadores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {judges.map((judge) => (
              <div key={judge.name} className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">{judge.avatar}</div>
                <p className="font-semibold text-white mb-1">{judge.name}</p>
                <p className="text-xs text-gray-400">{judge.role}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pregunta */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="dramatic-card p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Pregunta</h2>
          <p className="text-lg text-gray-200 leading-relaxed">
            {question.text}
          </p>
        </motion.div>

        {/* Formulario de respuesta */}
        {!isAdmin && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="dramatic-card p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Tu Respuesta</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                rows={8}
                className="input-field w-full mb-4"
                disabled={hasSubmitted || submitting}
              />

              <button
                type="submit"
                disabled={hasSubmitted || submitting || !answer.trim()}
                className="primary-button w-full py-3 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Enviando y evaluando...
                  </>
                ) : hasSubmitted ? (
                  <>
                    Respuesta enviada ✓
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Respuesta
                  </>
                )}
              </button>

              {hasSubmitted && !mySubmission?.feedbacks && (
                <p className="text-center text-green-400 text-sm mt-4">
                  Tu respuesta ha sido enviada y está siendo evaluada por los jueces.
                  Espera a que todos terminen...
                </p>
              )}
            </form>
          </motion.div>
        )}

        {/* Feedbacks inmediatos (después de enviar respuesta) */}
        {!isAdmin && mySubmission?.feedbacks && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              📊 Tu Evaluación
            </h2>
            <JudgeFeedbackDisplay
              feedbacks={mySubmission.feedbacks}
              playerName={game?.players[playerId!]?.name}
            />
            <p className="text-center text-cyan-400 text-sm mt-4">
              Espera a que el profesor avance a la siguiente ronda...
            </p>
          </motion.div>
        )}

        {/* Controles de profesor */}
        {isAdmin && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="dramatic-card p-6 bg-yellow-900/20"
          >
            <h3 className="text-yellow-300 font-bold mb-4 flex items-center gap-2">
              <span>👑</span>
              Controles de Profesor
            </h3>

            <div className="space-y-3">
              <button
                onClick={handlePause}
                className="primary-button w-full flex items-center justify-center gap-2"
              >
                {round.isPaused ? (
                  <>
                    <Play className="w-5 h-5" />
                    Reanudar Tiempo
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    Pausar Tiempo
                  </>
                )}
              </button>

              <button
                onClick={handleProcessRound}
                disabled={submittedCount === 0 || processing}
                className="primary-button w-full flex items-center justify-center gap-2"
              >
                <SkipForward className="w-5 h-5" />
                {allSubmitted
                  ? 'Ir a Resultados (Todos enviaron)'
                  : `Ir a Resultados (${submittedCount}/${totalPlayers})`
                }
              </button>

              <button
                onClick={handleForceFinish}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all w-full flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Terminar Juego (Podio Final)
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
