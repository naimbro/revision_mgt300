import { motion } from 'framer-motion';
import { JudgeFeedback } from '../types/game';
import { judges } from '../data/judges';

interface JudgeCardProps {
  feedback: JudgeFeedback;
  index: number;
}

export default function JudgeCard({ feedback, index }: JudgeCardProps) {
  const judgeInfo = judges.find(j => j.name === feedback.judgeName);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.2, type: 'spring' }}
      className="dramatic-card p-6"
    >
      {/* Header del juez */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{judgeInfo?.avatar || '👤'}</div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg">{feedback.judgeName}</h3>
          <p className="text-sm text-gray-400">{feedback.judgeRole}</p>
        </div>
        <div className={`text-4xl font-bold ${getScoreColor(feedback.score)}`}>
          {feedback.score}
        </div>
      </div>

      {/* Barra de progreso del puntaje */}
      <div className="mb-4">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${feedback.score}%` }}
            transition={{ delay: index * 0.2 + 0.3, duration: 0.8 }}
            className={`h-full bg-gradient-to-r ${getScoreGradient(feedback.score)}`}
          />
        </div>
      </div>

      {/* Feedback */}
      <div className="mb-4">
        <p className="text-gray-200 text-sm leading-relaxed">
          {feedback.feedback}
        </p>
      </div>

      {/* Tags */}
      {feedback.tags && feedback.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {feedback.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
