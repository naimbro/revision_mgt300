import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useGame } from '../hooks/useGame';
import { Loader, Play, Users, Copy, Check, UserX } from 'lucide-react';
import { motion } from 'framer-motion';
import { TOTAL_ROUNDS } from '../data/questions';

export default function Lobby() {
  const navigate = useNavigate();
  const gameCode = localStorage.getItem('gameCode');
  const playerId = localStorage.getItem('playerId');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const { game, loading } = useGame(gameCode);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  // Detectar si el jugador fue eliminado
  useEffect(() => {
    if (!isAdmin && game && playerId) {
      const currentPlayer = game.players[playerId];
      if (currentPlayer && !currentPlayer.isActive) {
        // El jugador fue eliminado
        alert('Has sido eliminado de la sala por el profesor.');
        localStorage.clear();
        navigate('/');
      }
    }
  }, [game, playerId, isAdmin, navigate]);

  // Sincronizar navegación cuando el juego comienza
  useEffect(() => {
    if (game?.state === 'playing') {
      navigate(`/round/${game.currentRound}`);
    }
  }, [game?.state, game?.currentRound, navigate]);

  const handleStartGame = async () => {
    if (!game || !gameCode) return;

    setStarting(true);
    try {
      await updateDoc(doc(db, 'games', gameCode), {
        state: 'playing',
        currentRound: 1,
        updatedAt: Timestamp.now(),
        [`rounds.1`]: {
          startTime: Timestamp.now(),
          isActive: true,
          questionId: 1,
          submissions: {},
          isPaused: false
        }
      });
    } catch (error) {
      console.error('Error starting game:', error);
      setStarting(false);
    }
  };

  const copyCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemovePlayer = async (playerUid: string) => {
    if (!game || !gameCode || !isAdmin) return;

    // Confirmar antes de eliminar
    const playerToRemove = game.players[playerUid];
    if (!confirm(`¿Eliminar a "${playerToRemove?.name}" de la sala?`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'games', gameCode), {
        [`players.${playerUid}.isActive`]: false,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Error al eliminar jugador. Intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando sala...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Juego no encontrado</p>
          <button onClick={() => navigate('/')} className="primary-button">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const players = Object.values(game.players).filter(p => p.isActive);
  const host = players.find(p => p.isAdmin);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Sala de Espera
          </h1>

          {/* Código del juego */}
          <div className="dramatic-card p-6 mb-6 inline-block">
            <p className="text-gray-400 text-sm mb-2">Código del Juego</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-white tracking-widest">
                {gameCode}
              </span>
              <button
                onClick={copyCode}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-6 h-6 text-green-400" />
                ) : (
                  <Copy className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <p className="text-gray-400">
            {isAdmin
              ? 'Comparte el código con tus estudiantes'
              : `Esperando al profesor... (${host?.name})`
            }
          </p>
        </motion.div>

        {/* Info del juego */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="dramatic-card p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Información del Juego
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-400">{TOTAL_ROUNDS}</p>
              <p className="text-sm text-gray-400">Preguntas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">4</p>
              <p className="text-sm text-gray-400">Jueces de IA</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">{players.length}</p>
              <p className="text-sm text-gray-400">Jugadores</p>
            </div>
          </div>
        </motion.div>

        {/* Lista de jugadores */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="dramatic-card p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            Jugadores ({players.length})
          </h2>
          <div className="space-y-2">
            {players.map((player, index) => (
              <motion.div
                key={player.uid}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  player.uid === playerId
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-slate-700/30'
                }`}
              >
                {player.photoURL ? (
                  <img
                    src={player.photoURL}
                    alt={player.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-white">
                    {player.name}
                    {player.uid === playerId && ' (Tú)'}
                  </p>
                  {player.isAdmin && (
                    <p className="text-xs text-yellow-400">👑 Profesor</p>
                  )}
                </div>
                {/* Botón eliminar (solo admin puede ver, solo para no-admins) */}
                {isAdmin && !player.isAdmin && (
                  <button
                    onClick={() => handleRemovePlayer(player.uid)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                    title="Eliminar jugador"
                  >
                    <UserX className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Botón de inicio (solo admin) */}
        {isAdmin && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={handleStartGame}
              disabled={starting || players.length < 1}
              className="primary-button py-4 px-8 text-lg flex items-center gap-3 mx-auto"
            >
              {starting ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Iniciar Juego
                </>
              )}
            </button>
            {players.length === 1 && (
              <p className="text-yellow-400 text-sm mt-4">
                Esperando más jugadores...
              </p>
            )}
          </motion.div>
        )}

        {/* Mensaje para estudiantes */}
        {!isAdmin && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="dramatic-card p-6 bg-cyan-900/20">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
              <p className="text-gray-300">
                Esperando a que el profesor inicie el juego...
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
