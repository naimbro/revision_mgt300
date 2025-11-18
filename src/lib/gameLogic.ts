// Generar código único de 6 caracteres para el juego
export function generateGameCode(): string {
  // Solo caracteres no ambiguos (sin O, 0, I, 1, etc.)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Calcular ranking de jugadores
export function calculateRankings(players: any[]) {
  return players
    .filter(p => p.isActive)
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((player, index) => ({
      ...player,
      rank: index + 1
    }));
}

// Obtener emoji de medalla según posición
export function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return `${rank}°`;
  }
}

// Calcular promedio de puntajes de jueces
export function calculateAverageScore(feedbacks: any[]): number {
  if (!feedbacks || feedbacks.length === 0) return 0;
  const sum = feedbacks.reduce((acc, f) => acc + f.score, 0);
  return sum / feedbacks.length;
}

// Extraer todos los tags de feedbacks
export function extractAllTags(feedbacks: any[]): string[] {
  const tagsSet = new Set<string>();
  feedbacks.forEach(feedback => {
    if (feedback.tags) {
      feedback.tags.forEach((tag: string) => tagsSet.add(tag));
    }
  });
  return Array.from(tagsSet);
}
