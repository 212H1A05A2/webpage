export type GameType = 'OX' | 'SOS';
export type GameMode = 'PVP' | 'AI';
export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type SOSBoardSize = 3 | 5 | 7 | 9;
export type OXSymbol = 'X' | 'O';
export type SOSSymbol = 'S' | 'O';

export interface Player {
  id: string;
  name: string;
  avatar: string; // Emoji avatar or icon key
  color: string;
  isAI?: boolean;
}

export interface UserProfile {
  name: string;
  avatar: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  theme: 'dark' | 'light';
  haptics: boolean;
  reducedMotion: boolean;
}

export interface GameStats {
  totalGames: number;
  ox: {
    played: number;
    wins: number;
    losses: number;
    draws: number;
  };
  sos: {
    played: number;
    wins: number;
    losses: number;
    draws: number;
    totalSOSFormed: number;
    maxSOSInOneGame: number;
  };
  streak: {
    current: number;
    best: number;
  };
}

export interface GameHistoryItem {
  id: string;
  gameType: GameType;
  mode: GameMode;
  difficulty?: AIDifficulty;
  date: string;
  player1: string;
  player2: string;
  winner: string | 'DRAW';
  score?: { p1: number; p2: number };
  movesCount: number;
  boardSize?: number;
}
