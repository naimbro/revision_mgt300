import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <BookOpen className="w-20 h-20 mx-auto text-blue-400 mb-4" />
            <h1 className="text-5xl font-bold gradient-text mb-4">
              MGT300
            </h1>
            <h2 className="text-3xl font-semibold text-white mb-2">
              Revisión Unidad 2
            </h2>
            <p className="text-gray-400 text-lg">
              Semana de Preparación para la Prueba
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="dramatic-card p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold text-white">
                Evaluación con 3 Jueces de IA
              </h3>
            </div>
            <p className="text-gray-300 text-left">
              Responde preguntas sobre Destrucción Creativa, Desigualdad,
              Instituciones y Antropoceno. Recibe feedback personalizado de
              tres jueces especializados que evaluarán tu comprensión conceptual,
              uso de evidencia y análisis institucional.
            </p>
          </motion.div>
        </div>

        {/* Botones */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <button
            onClick={() => navigate('/create')}
            className="primary-button w-full py-4 text-lg flex items-center justify-center gap-3"
          >
            <Users className="w-6 h-6" />
            Crear Juego (Profesor)
          </button>

          <button
            onClick={() => navigate('/join')}
            className="dramatic-card w-full py-4 text-lg flex items-center justify-center gap-3 hover:bg-slate-700/50 transition-all"
          >
            <BookOpen className="w-6 h-6" />
            Unirse a Juego (Estudiante)
          </button>
        </motion.div>

        {/* Info de temas */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
        >
          <div className="dramatic-card p-4">
            <div className="text-2xl mb-2">💡</div>
            <p className="text-sm text-gray-300">Destrucción Creativa</p>
          </div>
          <div className="dramatic-card p-4">
            <div className="text-2xl mb-2">⚖️</div>
            <p className="text-sm text-gray-300">Desigualdad</p>
          </div>
          <div className="dramatic-card p-4">
            <div className="text-2xl mb-2">🏛️</div>
            <p className="text-sm text-gray-300">Instituciones</p>
          </div>
          <div className="dramatic-card p-4">
            <div className="text-2xl mb-2">🌍</div>
            <p className="text-sm text-gray-300">Antropoceno</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
