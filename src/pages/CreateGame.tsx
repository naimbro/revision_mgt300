import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { db, loginWithGoogle } from '../lib/firebase';
import { generateGameCode } from '../lib/gameLogic';
import { TOTAL_ROUNDS } from '../data/questions';
import { Loader, Trophy, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateGame() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Login con Google (SOLO para profesores)
      const user = await loginWithGoogle();

      // 2. Generar código único de 6 caracteres
      const gameCode = generateGameCode();

      // 3. Crear juego en Firestore
      await setDoc(doc(db, 'games', gameCode), {
        gameCode,
        hostId: user.uid,
        state: 'waiting',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        currentRound: 0,
        totalRounds: TOTAL_ROUNDS,
        players: {
          [user.uid]: {
            uid: user.uid,
            name: user.displayName || 'Profesor',
            photoURL: user.photoURL || '',
            isAdmin: true,
            isActive: true,
            totalScore: 0,
            joinedAt: Timestamp.now()
          }
        },
        rounds: {}
      });

      // 4. Guardar en localStorage
      localStorage.setItem('gameCode', gameCode);
      localStorage.setItem('playerId', user.uid);
      localStorage.setItem('isAdmin', 'true');

      // 5. Navegar a Lobby
      navigate('/lobby');
    } catch (err: any) {
      console.error('Error creating game:', err);
      setError(err.message || 'Error al crear el juego');
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
            <Trophy className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Crear Juego
            </h1>
            <p className="text-gray-400">
              Solo para profesores
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">
                Características del juego:
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• {TOTAL_ROUNDS} preguntas sobre Unidad 2</li>
                <li>• Evaluación con 3 jueces de IA</li>
                <li>• Feedback personalizado en tiempo real</li>
                <li>• Controles de profesor (pausa, skip)</li>
                <li>• Informe final por estudiante</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreateGame}
              disabled={loading}
              className="primary-button w-full py-4 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Creando juego...
                </span>
              ) : (
                'Iniciar sesión con Google y Crear'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Se te pedirá que inicies sesión con tu cuenta de Google.
              Los estudiantes se unirán con un código.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
