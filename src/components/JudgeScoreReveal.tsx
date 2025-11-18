import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JudgeFeedback } from '../types/game';
import { judges } from '../data/judges';
import { playRevealSound, playCelebrationSound, playDisappointmentSound } from '../lib/audio';

interface JudgeScoreRevealProps {
  feedbacks: JudgeFeedback[];
  onComplete: () => void;
}

export default function JudgeScoreReveal({ feedbacks, onComplete }: JudgeScoreRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    if (currentIndex < feedbacks.length) {
      // Mostrar juez
      playRevealSound();

      // Después de 300ms, mostrar puntaje
      const scoreTimer = setTimeout(() => {
        setShowScore(true);
        const score = feedbacks[currentIndex].score;
        if (score >= 70) {
          playCelebrationSound();
        } else if (score < 50) {
          playDisappointmentSound();
        }
      }, 300);

      // Después de 2s, siguiente juez
      const nextTimer = setTimeout(() => {
        if (currentIndex < feedbacks.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowScore(false);
        } else {
          setTimeout(onComplete, 1000);
        }
      }, 2500);

      return () => {
        clearTimeout(scoreTimer);
        clearTimeout(nextTimer);
      };
    }
  }, [currentIndex, feedbacks, onComplete]);

  if (currentIndex >= feedbacks.length) {
    return null;
  }

  const currentFeedback = feedbacks[currentIndex];
  const judgeInfo = judges.find(j => j.name === currentFeedback.judgeName);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="mb-8"
          >
            <div className="text-9xl mb-4">{judgeInfo?.avatar || '👤'}</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {currentFeedback.judgeName}
            </h2>
            <p className="text-xl text-gray-400">{currentFeedback.judgeRole}</p>
          </motion.div>

          {showScore && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <div className="dramatic-card p-8 bg-gradient-to-br from-blue-900/80 to-cyan-900/80">
                <p className="text-gray-300 mb-4">Puntaje</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-8xl font-bold gradient-text"
                >
                  {currentFeedback.score}
                </motion.p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <div className="flex justify-center gap-2">
              {feedbacks.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentIndex
                      ? 'bg-blue-400'
                      : index < currentIndex
                      ? 'bg-cyan-400'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
