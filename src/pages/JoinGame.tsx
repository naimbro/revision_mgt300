import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, loginAnonymously } from '../lib/firebase';
import { Loader, Users, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JoinGame() {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameCode.trim() || !playerName.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Login anónimo (Firebase Auth)
      const user = await loginAnonymously();

      // 2. Validar que el código de juego existe
      const gameRef = doc(db, 'games', gameCode.toUpperCase());
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) {
        setError('Código de juego inválido');
        setLoading(false);
        return;
      }

      const gameData = gameSnap.data();
      if (gameData.state !== 'waiting') {
        setError('El juego ya ha comenzado');
        setLoading(false);
        return;
      }

      // 3. Agregar jugador al juego
      await updateDoc(gameRef, {
        [`players.${user.uid}`]: {
          uid: user.uid,
          name: playerName.trim(),
          isAdmin: false,
          isActive: true,
          totalScore: 0,
          joinedAt: Timestamp.now()
        },
        updatedAt: Timestamp.now()
      });

      // 4. Guardar en localStorage
      localStorage.setItem('gameCode', gameCode.toUpperCase());
      localStorage.setItem('playerId', user.uid);
      localStorage.setItem('isAdmin', 'false');

      // 5. Navegar a Lobby
      navigate('/lobby');
    } catch (err: any) {
      console.error('Error joining game:', err);
      setError(err.message || 'Error al unirse al juego');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full"
      >
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="dramatic-card p-8">
          <div className="text-center mb-8">
            <Users className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Unirse a Juego
            </h1>
            <p className="text-gray-400">
              Ingresa el código compartido por tu profesor
            </p>
          </div>

          <form onSubmit={handleJoinGame} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Código del Juego
              </label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                maxLength={6}
                className="input-field w-full text-center text-2xl font-bold tracking-widest uppercase"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tu Nombre
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Nombre completo"
                className="input-field w-full"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !gameCode.trim() || !playerName.trim()}
              className="primary-button w-full py-4 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Uniéndose...
                </span>
              ) : (
                'Unirse al Juego'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
