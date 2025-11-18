import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../hooks/useGame';
import { Loader, Home, Download } from 'lucide-react';
import { getMedalEmoji } from '../lib/gameLogic';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import jsPDF from 'jspdf';

export default function End() {
  const navigate = useNavigate();
  const gameCode = localStorage.getItem('gameCode');
  const playerId = localStorage.getItem('playerId');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const { game, loading } = useGame(gameCode);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const handleNewGame = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleDownloadReport = async (targetPlayerId?: string) => {
    if (!game || !gameCode || downloadingReport) return;

    const playerIdToUse = targetPlayerId || playerId;
    if (!playerIdToUse) return;

    setDownloadingReport(true);

    try {
      // Llamar a Cloud Function para generar reporte con IA
      const generateReport = httpsCallable(functions, 'generateReport');
      const result = await generateReport({ gameCode, playerId: playerIdToUse });
      const report: any = result.data;

      // Generar PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Título
      doc.setFontSize(20);
      doc.setTextColor(75, 0, 130); // Purple
      doc.text('Reporte de Desempeño', margin, y);
      y += 10;

      doc.setFontSize(16);
      doc.text('MGT300 - Unidad 2', margin, y);
      y += 15;

      // Información del jugador
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Estudiante: ${report.playerName}`, margin, y);
      y += 8;
      doc.text(`Puntaje Promedio: ${report.totalScore.toFixed(1)}`, margin, y);
      y += 12;

      // Conceptos fuertes
      doc.setFontSize(14);
      doc.setTextColor(34, 139, 34); // Green
      doc.text('Conceptos Dominados:', margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      report.strongConcepts.slice(0, 5).forEach((concept: string) => {
        doc.text(`• ${concept}`, margin + 5, y);
        y += 6;
      });
      y += 8;

      // Conceptos a reforzar
      doc.setFontSize(14);
      doc.setTextColor(220, 20, 60); // Red
      doc.text('Áreas a Reforzar:', margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      report.weakConcepts.slice(0, 5).forEach((concept: string) => {
        doc.text(`• ${concept}`, margin + 5, y);
        y += 6;
      });
      y += 10;

      // Recomendaciones de IA
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204); // Blue
      doc.text('Recomendaciones Personalizadas:', margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      report.recommendations.forEach((rec: string) => {
        const lines = doc.splitTextToSize(rec, pageWidth - 2 * margin - 5);
        doc.text(`• ${lines[0]}`, margin + 5, y);
        y += 6;
        for (let i = 1; i < lines.length; i++) {
          doc.text(`  ${lines[i]}`, margin + 5, y);
          y += 6;
        }
        y += 2;
      });

      // Descargar PDF
      doc.save(`reporte_${report.playerName.replace(/\s+/g, '_')}_MGT300.pdf`);

      alert('Reporte descargado exitosamente');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte. Por favor intenta de nuevo.');
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Error cargando resultados</p>
      </div>
    );
  }

  const players = Object.values(game.players).filter(p => p.isActive && !p.isAdmin);
  const rankings = players.sort((a, b) => b.totalScore - a.totalScore);
  const [gold, silver, bronze] = rankings;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-5xl font-bold text-center mb-12 gradient-text"
        >
          🏆 ¡Juego Completado! 🏆
        </motion.h1>

        {/* Podio Olímpico */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex items-end justify-center gap-4 h-96">
            {/* Plata (2do lugar) */}
            {silver && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="flex flex-col items-center"
              >
                <div className="text-6xl mb-2">🥈</div>
                <div className="bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-lg p-6 w-48 h-64 flex flex-col items-center justify-end shadow-2xl">
                  <p className="text-white font-bold text-xl mb-2 text-center">
                    {silver.name}
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {silver.totalScore.toFixed(1)}
                  </p>
                  <p className="text-white/70 text-sm mt-2">2° Lugar</p>
                </div>
              </motion.div>
            )}

            {/* Oro (1er lugar) */}
            {gold && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  className="text-8xl mb-2"
                >
                  🥇
                </motion.div>
                <div className="bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-t-lg p-6 w-56 h-80 flex flex-col items-center justify-end shadow-2xl">
                  <p className="text-white font-bold text-2xl mb-2 text-center">
                    {gold.name}
                  </p>
                  <p className="text-5xl font-bold text-white">
                    {gold.totalScore.toFixed(1)}
                  </p>
                  <p className="text-white/90 text-lg mt-2">🏆 CAMPEÓN 🏆</p>
                </div>
              </motion.div>
            )}

            {/* Bronce (3er lugar) */}
            {bronze && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="flex flex-col items-center"
              >
                <div className="text-6xl mb-2">🥉</div>
                <div className="bg-gradient-to-b from-orange-300 to-orange-600 rounded-t-lg p-6 w-48 h-48 flex flex-col items-center justify-end shadow-2xl">
                  <p className="text-white font-bold text-xl mb-2 text-center">
                    {bronze.name}
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {bronze.totalScore.toFixed(1)}
                  </p>
                  <p className="text-white/70 text-sm mt-2">3° Lugar</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Ranking completo */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto dramatic-card p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            📋 Clasificación Final
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-500/30">
                  <th className="text-left py-3 px-2 text-gray-400">Posición</th>
                  <th className="text-left py-3 px-2 text-gray-400">Jugador</th>
                  <th className="text-right py-3 px-2 text-gray-400">Puntaje Final</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((player, index) => (
                  <motion.tr
                    key={player.uid}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    className={`border-b border-slate-700 ${
                      index < 3 ? 'bg-yellow-500/10' : ''
                    } ${player.uid === playerId ? 'bg-blue-500/20' : ''}`}
                  >
                    <td className="py-3 px-2 font-bold text-xl">
                      {getMedalEmoji(index + 1)}
                    </td>
                    <td className="py-3 px-2 font-semibold text-white">
                      {player.name}
                      {player.uid === playerId && ' (Tú)'}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-2xl text-white">
                      {player.totalScore.toFixed(1)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Botones finales */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center"
        >
          {/* Botón de descargar reporte (para estudiantes y admin) */}
          {!isAdmin && playerId && (
            <button
              onClick={() => handleDownloadReport()}
              disabled={downloadingReport}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingReport ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Descargar Mi Reporte
                </>
              )}
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="primary-button py-3 px-6 flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Volver al Inicio
          </button>

          {isAdmin && (
            <button
              onClick={handleNewGame}
              className="primary-button py-3 px-6 flex items-center gap-2"
            >
              🎮 Nuevo Juego
            </button>
          )}
        </motion.div>

        {/* Mensaje de agradecimiento */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 text-lg">
            ¡Gracias por participar!
          </p>
          <p className="text-gray-500 text-sm mt-2">
            MGT300 - Revisión Unidad 2
          </p>
        </motion.div>
      </div>
    </div>
  );
}
