import { motion } from 'framer-motion';
import { JudgeFeedback } from '../types/game';
import JudgeCard from './JudgeCard';
import { calculateAverageScore } from '../lib/gameLogic';
import { Sparkles, TrendingUp, Target } from 'lucide-react';

interface JudgeFeedbackDisplayProps {
  feedbacks: JudgeFeedback[];
  playerName?: string;
}

export default function JudgeFeedbackDisplay({ feedbacks, playerName }: JudgeFeedbackDisplayProps) {
  if (!feedbacks || feedbacks.length === 0) {
    return null;
  }

  const averageScore = calculateAverageScore(feedbacks);

  // Determinar efectos según puntaje
  const getScoreEffects = (score: number) => {
    if (score >= 85) {
      return {
        bgGradient: 'from-emerald-900/50 to-green-900/50',
        icon: Sparkles,
        iconColor: 'text-yellow-300',
        message: '¡Excelente trabajo!',
        messageColor: 'text-green-400',
        animation: {
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0],
        },
        duration: 0.6
      };
    } else if (score >= 70) {
      return {
        bgGradient: 'from-blue-900/50 to-cyan-900/50',
        icon: TrendingUp,
        iconColor: 'text-cyan-400',
        message: 'Buen desempeño',
        messageColor: 'text-cyan-400',
        animation: {
          scale: [1, 1.02, 1],
        },
        duration: 0.5
      };
    } else if (score >= 50) {
      return {
        bgGradient: 'from-amber-900/50 to-orange-900/50',
        icon: Target,
        iconColor: 'text-amber-400',
        message: 'Sigue mejorando',
        messageColor: 'text-amber-400',
        animation: {
          scale: [1, 1.01, 1],
        },
        duration: 0.4
      };
    } else {
      return {
        bgGradient: 'from-red-900/50 to-rose-900/50',
        icon: Target,
        iconColor: 'text-rose-400',
        message: 'No te rindas',
        messageColor: 'text-rose-400',
        animation: {
          scale: [1, 0.98, 1],
        },
        duration: 0.4
      };
    }
  };

  const effects = getScoreEffects(averageScore);
  const Icon = effects.icon;

  return (
    <div className="space-y-6">
      {/* Score promedio con efectos */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{ duration: 0.5 }}
        className={`dramatic-card p-6 bg-gradient-to-br ${effects.bgGradient} relative overflow-hidden`}
      >
        {/* Efectos de fondo para puntajes altos */}
        {averageScore >= 85 && (
          <>
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
            >
              <Sparkles className="w-20 h-20 text-yellow-300/20" />
            </motion.div>
          </>
        )}

        <div className="text-center relative z-10">
          <motion.div
            animate={effects.animation}
            transition={{ duration: effects.duration, repeat: Infinity, repeatDelay: 2 }}
          >
            <Icon className={`w-12 h-12 ${effects.iconColor} mx-auto mb-3`} />
          </motion.div>
          {playerName && (
            <h3 className="text-lg text-gray-300 mb-2">{playerName}</h3>
          )}
          <p className="text-gray-400 text-sm mb-2">Puntaje Promedio</p>
          <motion.p
            className="text-6xl font-bold gradient-text"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.3 }}
          >
            {averageScore.toFixed(1)}
          </motion.p>
          <p className="text-sm text-gray-400 mt-2">de 100</p>
          <motion.p
            className={`text-lg font-semibold mt-3 ${effects.messageColor}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {effects.message}
          </motion.p>
        </div>
      </motion.div>

      {/* Cards de jueces */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-4">
          Evaluaciones Individuales
        </h3>
        {feedbacks.map((feedback, index) => (
          <JudgeCard key={index} feedback={feedback} index={index} />
        ))}
      </div>
    </div>
  );
}
