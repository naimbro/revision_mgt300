import { motion } from 'framer-motion';
import { JudgeFeedback } from '../types/game';
import JudgeCard from './JudgeCard';
import { calculateAverageScore } from '../lib/gameLogic';
import { Award } from 'lucide-react';

interface JudgeFeedbackDisplayProps {
  feedbacks: JudgeFeedback[];
  playerName?: string;
}

export default function JudgeFeedbackDisplay({ feedbacks, playerName }: JudgeFeedbackDisplayProps) {
  if (!feedbacks || feedbacks.length === 0) {
    return null;
  }

  const averageScore = calculateAverageScore(feedbacks);

  return (
    <div className="space-y-6">
      {/* Score promedio */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="dramatic-card p-6 bg-gradient-to-br from-blue-900/50 to-cyan-900/50"
      >
        <div className="text-center">
          <Award className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          {playerName && (
            <h3 className="text-lg text-gray-300 mb-2">{playerName}</h3>
          )}
          <p className="text-gray-400 text-sm mb-2">Puntaje Promedio</p>
          <p className="text-6xl font-bold gradient-text">
            {averageScore.toFixed(1)}
          </p>
          <p className="text-sm text-gray-400 mt-2">de 100</p>
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
