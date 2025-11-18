import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useGame } from '../hooks/useGame';
import { getMedalEmoji } from '../lib/gameLogic';
import { getQuestionById } from '../data/questions';
import JudgeFeedbackDisplay from '../components/JudgeFeedbackDisplay';
import { Loader, ArrowRight, Trophy, TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Results() {
  const { roundNumber } = useParams();
  const navigate = useNavigate();
  const gameCode = localStorage.getItem('gameCode');
  const playerId = localStorage.getItem('playerId');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const { game, loading } = useGame(gameCode);
  const [proceeding, setProceeding] = useState(false);

  const currentRound = parseInt(roundNumber || '1');
  const round = game?.rounds[currentRound];
  const question = getQuestionById(currentRound);

  // Sincronizar navegación
  useEffect(() => {
    if (game?.state === 'playing') {
      navigate(`/round/${game.currentRound}`);
    }
    if (game?.state === 'completed') {
      navigate('/end');
    }
  }, [game?.state, game?.currentRound, navigate]);

  const handleNextRound = async () => {
    if (!game || !gameCode || proceeding) return;

    setProceeding(true);

    try {
      if (currentRound < game.totalRounds) {
        // Siguiente ronda
        const nextRound = currentRound + 1;
        await updateDoc(doc(db, 'games', gameCode), {
          currentRound: nextRound,
          state: 'playing',
          updatedAt: Timestamp.now(),
          [`rounds.${nextRound}`]: {
            startTime: Timestamp.now(),
            isActive: true,
            questionId: nextRound,
            submissions: {},
            isPaused: false
          }
        });
      } else {
        // Juego completado
        await updateDoc(doc(db, 'games', gameCode), {
          state: 'completed',
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error advancing:', error);
      setProceeding(false);
    }
  };

  const handleEndGame = async () => {
    if (!game || !gameCode || proceeding) return;

    setProceeding(true);

    try {
      // Terminar el juego inmediatamente
      await updateDoc(doc(db, 'games', gameCode), {
        state: 'completed',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error ending game:', error);
      setProceeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!game || !round) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Error cargando resultados</p>
      </div>
    );
  }

  const players = Object.values(game.players).filter(p => p.isActive && !p.isAdmin);

  // Calcular promedio acumulado y rankings históricos
  const rankings = players
    .map(p => {
      const roundScore = p.roundScores?.[currentRound] || 0;
      const averageScore = p.totalScore / currentRound; // Promedio acumulado
      return {
        ...p,
        roundScore,
        averageScore
      };
    })
    .sort((a, b) => b.averageScore - a.averageScore); // Ordenar por promedio

  // Calcular rankings de ronda anterior para detectar cambios
  const previousRankings = currentRound > 1 ? players
    .map(p => {
      const prevAverage = (p.totalScore - (p.roundScores?.[currentRound] || 0)) / (currentRound - 1);
      return {
        uid: p.uid,
        averageScore: prevAverage
      };
    })
    .sort((a, b) => b.averageScore - a.averageScore) : [];

  // Calcular rankings de 2 rondas atrás para detectar "on fire"
  const twoRoundsAgoRankings = currentRound > 2 ? players
    .map(p => {
      const twoRoundsAgoTotal = p.totalScore - (p.roundScores?.[currentRound] || 0) - (p.roundScores?.[currentRound - 1] || 0);
      const twoRoundsAgoAverage = twoRoundsAgoTotal / (currentRound - 2);
      return {
        uid: p.uid,
        averageScore: twoRoundsAgoAverage
      };
    })
    .sort((a, b) => b.averageScore - a.averageScore) : [];

  // Calcular indicadores de cambio
  const rankingsWithIndicators = rankings.map((player, index) => {
    const currentPos = index + 1;
    const prevPos = previousRankings.findIndex(p => p.uid === player.uid) + 1;
    const twoRoundsAgoPos = twoRoundsAgoRankings.findIndex(p => p.uid === player.uid) + 1;

    let rankChange = 0;
    let isOnFire = false;

    if (prevPos > 0) {
      rankChange = prevPos - currentPos; // Positivo = subió, Negativo = bajó
    }

    // "On fire" si subió en las últimas 2 rondas consecutivas
    if (prevPos > 0 && twoRoundsAgoPos > 0) {
      const prevChange = twoRoundsAgoPos - prevPos;
      isOnFire = rankChange > 0 && prevChange > 0;
    }

    return {
      ...player,
      rankChange,
      isOnFire
    };
  });

  const mySubmission = playerId ? round.submissions[playerId] : null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Resultados - Ronda {currentRound}
          </h1>
          {question && (
            <p className="text-gray-400">{question.category}</p>
          )}
        </motion.div>

        {/* Mi feedback (si no es admin) */}
        {!isAdmin && mySubmission?.feedbacks && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Tu Evaluación
            </h2>
            <JudgeFeedbackDisplay
              feedbacks={mySubmission.feedbacks}
              playerName={game.players[playerId!]?.name}
            />
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: isAdmin ? 0.1 : 0.3 }}
          className="dramatic-card p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            Clasificación General
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-500/30">
                  <th className="text-left py-3 px-2 text-gray-400">Pos</th>
                  <th className="text-left py-3 px-2 text-gray-400">Jugador</th>
                  <th className="text-right py-3 px-2 text-gray-400">Esta Ronda</th>
                  <th className="text-right py-3 px-2 text-gray-400">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {rankingsWithIndicators.map((player, index) => (
                  <motion.tr
                    key={player.uid}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * index }}
                    className={`border-b border-slate-700 ${
                      player.uid === playerId ? 'bg-blue-500/20' : ''
                    }`}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xl">
                          {getMedalEmoji(index + 1)}
                        </span>
                        {player.isOnFire && (
                          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>
                          {player.name}
                          {player.uid === playerId && ' (Tú)'}
                        </span>
                        {player.rankChange > 0 && (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                        {player.rankChange < 0 && (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right text-cyan-400 font-bold">
                      +{player.roundScore.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-2xl text-white">
                      {player.averageScore.toFixed(1)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Botones de control (solo admin) */}
        {isAdmin && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {currentRound < game.totalRounds && (
              <button
                onClick={handleNextRound}
                disabled={proceeding}
                className="primary-button py-4 px-8 text-lg flex items-center gap-3"
              >
                {proceeding ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Avanzando...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-6 h-6" />
                    Siguiente Ronda ({currentRound + 1}/{game.totalRounds})
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleEndGame}
              disabled={proceeding}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {proceeding ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <Trophy className="w-6 h-6" />
                  {currentRound < game.totalRounds ? 'Terminar Juego Ahora' : 'Ver Podio Final'}
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Mensaje para estudiantes */}
        {!isAdmin && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="dramatic-card p-6 bg-cyan-900/20">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
              <p className="text-gray-300">
                Esperando al profesor...
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
