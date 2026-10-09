import { GameSettings, GameStats, GameHistoryItem, UserProfile } from '../types';

const SETTINGS_KEY = 'ox_sos_settings';
const STATS_KEY = 'ox_sos_stats';
const PROFILE_KEY = 'ox_sos_profile';
const HISTORY_KEY = 'ox_sos_history';

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: false,
  theme: 'dark',
  haptics: true,
  reducedMotion: false,
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Player 1',
  avatar: '🦊',
};

export const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  ox: {
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  },
  sos: {
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    totalSOSFormed: 0,
    maxSOSInOneGame: 0,
  },
  streak: {
    current: 0,
    best: 0,
  },
};

export const AVATAR_OPTIONS = ['🦊', '🐼', '🐯', '🦁', '🐱', '🐶', '🦄', '🐲', '🤖', '👾', '🚀', '⭐', '🔥', '👑', '⚡', '💎'];

export const storage = {
  getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Storage quota or privacy restriction
    }
  },

  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore
    }
  },

  getStats(): GameStats {
    try {
      const data = localStorage.getItem(STATS_KEY);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  },

  saveStats(stats: GameStats) {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // Ignore
    }
  },

  recordOXResult(isWin: boolean, isLoss: boolean, isDraw: boolean) {
    const stats = this.getStats();
    stats.totalGames += 1;
    stats.ox.played += 1;
    if (isWin) {
      stats.ox.wins += 1;
      stats.streak.current += 1;
      if (stats.streak.current > stats.streak.best) {
        stats.streak.best = stats.streak.current;
      }
    } else if (isLoss) {
      stats.ox.losses += 1;
      stats.streak.current = 0;
    } else if (isDraw) {
      stats.ox.draws += 1;
    }
    this.saveStats(stats);
    return stats;
  },

  recordSOSResult(isWin: boolean, isLoss: boolean, isDraw: boolean, sosFormedInGame: number) {
    const stats = this.getStats();
    stats.totalGames += 1;
    stats.sos.played += 1;
    stats.sos.totalSOSFormed += sosFormedInGame;
    if (sosFormedInGame > stats.sos.maxSOSInOneGame) {
      stats.sos.maxSOSInOneGame = sosFormedInGame;
    }

    if (isWin) {
      stats.sos.wins += 1;
      stats.streak.current += 1;
      if (stats.streak.current > stats.streak.best) {
        stats.streak.best = stats.streak.current;
      }
    } else if (isLoss) {
      stats.sos.losses += 1;
      stats.streak.current = 0;
    } else if (isDraw) {
      stats.sos.draws += 1;
    }
    this.saveStats(stats);
    return stats;
  },

  getHistory(): GameHistoryItem[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addHistory(item: Omit<GameHistoryItem, 'id' | 'date'>) {
    try {
      const history = this.getHistory();
      const newItem: GameHistoryItem = {
        ...item,
        id: 'game_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        date: new Date().toISOString(),
      };
      history.unshift(newItem);
      // Keep recent 50
      if (history.length > 50) history.pop();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Ignore
    }
  },

  resetStats() {
    this.saveStats(DEFAULT_STATS);
  },

  resetAllData() {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(HISTORY_KEY);
  }
};
