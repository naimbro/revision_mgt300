import { Timestamp } from 'firebase/firestore';

export interface Player {
  uid: string;
  name: string;
  photoURL?: string;
  isAdmin: boolean;
  isActive: boolean;
  joinedAt: Timestamp | Date;
  totalScore: number;
  roundScores?: { [roundNumber: number]: number };
}

export interface JudgeFeedback {
  judgeName: string;
  judgeRole: string;
  score: number;
  feedback: string;
  tags: string[];
}

export interface Submission {
  answer: string;
  submittedAt: Timestamp | Date;
  feedbacks?: JudgeFeedback[];
  totalScore?: number;
  averageScore?: number;
}

export interface Round {
  startTime: Timestamp | Date;
  endTime?: Timestamp | Date;
  isActive: boolean;
  questionId: number;
  isPaused?: boolean;
  pausedAt?: Timestamp | Date;
  submissions: {
    [userId: string]: Submission;
  };
  results?: {
    rankings: Array<{
      playerId: string;
      playerName: string;
      score: number;
      rank: number;
    }>;
  };
}

export interface Game {
  id?: string;
  gameCode: string;
  hostId: string;
  state: 'waiting' | 'playing' | 'results' | 'completed';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  currentRound: number;
  totalRounds: number;
  players: {
    [userId: string]: Player;
  };
  rounds: {
    [roundNumber: string]: Round;
  };
}

export interface Question {
  id: number;
  category: string;
  text: string;
  theme: 'A' | 'B' | 'C' | 'D'; // A: Destrucción creativa, B: Desigualdad, C: Instituciones, D: Antropoceno
  expectedConcepts?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Judge {
  name: string;
  role: string;
  description: string;
  avatar: string;
  color: string;
}

export interface PlayerReport {
  playerId: string;
  playerName: string;
  totalScore: number;
  strongConcepts: string[];
  weakConcepts: string[];
  recommendations: string[];
  themeScores: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  allFeedbacks: JudgeFeedback[];
}
