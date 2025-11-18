import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Game } from '../types/game';

export const useGame = (gameCode: string | null) => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameCode) {
      setLoading(false);
      return;
    }

    // Suscripción en tiempo real
    const unsubscribe = onSnapshot(
      doc(db, 'games', gameCode),
      (snapshot) => {
        if (snapshot.exists()) {
          setGame({ id: snapshot.id, ...snapshot.data() } as Game);
          setError(null);
        } else {
          setError(new Error('Juego no encontrado'));
          setGame(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error en suscripción:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup al desmontar
    return () => unsubscribe();
  }, [gameCode]);

  return { game, loading, error };
};
