import React from 'react';
import { GameStats } from '../../types';
import { Modal, Button } from '../ui/Common';
import { Trophy, Award, Flame, Gamepad2, TrendingUp } from 'lucide-react';
import { sound } from '../../services/sound';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'ox' | 'sos'>('overview');

  const totalWins = stats.ox.wins + stats.sos.wins;
  const totalLosses = stats.ox.losses + stats.sos.losses;
  const totalDraws = stats.ox.draws + stats.sos.draws;
  const winRate = stats.totalGames > 0 ? Math.round((totalWins / stats.totalGames) * 100) : 0;
  const oxWinRate = stats.ox.played > 0 ? Math.round((stats.ox.wins / stats.ox.played) * 100) : 0;
  const sosWinRate = stats.sos.played > 0 ? Math.round((stats.sos.wins / stats.sos.played) * 100) : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 Career Statistics & Records" maxWidth="lg">
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
          <button
            onClick={() => {
              setActiveTab('overview');
              sound.playClick();
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              setActiveTab('ox');
              sound.playClick();
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'ox' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            OX Game
          </button>
          <button
            onClick={() => {
              setActiveTab('sos');
              sound.playClick();
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'sos' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            SOS Game
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            {/* Top Highlight Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex flex-col items-center justify-center text-center">
                <Gamepad2 className="text-indigo-400 mb-1" size={22} />
                <span className="text-2xl font-black text-white">{stats.totalGames}</span>
                <span className="text-xs text-slate-400 font-medium">Total Matches</span>
              </div>

              <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex flex-col items-center justify-center text-center">
                <Trophy className="text-amber-400 mb-1" size={22} />
                <span className="text-2xl font-black text-amber-300">{totalWins}</span>
                <span className="text-xs text-slate-400 font-medium">Victories</span>
              </div>

              <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex flex-col items-center justify-center text-center">
                <TrendingUp className="text-emerald-400 mb-1" size={22} />
                <span className="text-2xl font-black text-emerald-400">{winRate}%</span>
                <span className="text-xs text-slate-400 font-medium">Win Ratio</span>
              </div>

              <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex flex-col items-center justify-center text-center">
                <Flame className="text-rose-500 mb-1" size={22} />
                <span className="text-2xl font-black text-rose-400">{stats.streak.current}</span>
                <span className="text-xs text-slate-400 font-medium">Win Streak</span>
              </div>
            </div>

            {/* Streak & SOS Formations banner */}
            <div className="p-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border border-purple-700/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Award size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Best All-Time Win Streak</h4>
                  <p className="text-xs text-slate-300">Continuous victories across all game modes</p>
                </div>
              </div>
              <div className="text-2xl font-extrabold text-amber-400 px-3 py-1 bg-amber-500/10 rounded-xl border border-amber-500/30">
                {stats.streak.best} 🔥
              </div>
            </div>

            {/* Aggregate breakdown */}
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1">
                <span>Summary Breakdown</span>
                <span>{totalWins}W - {totalLosses}L - {totalDraws}D</span>
              </div>
              {/* Multi-segmented Progress Bar */}
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
                <div style={{ width: `${stats.totalGames > 0 ? (totalWins / stats.totalGames) * 100 : 0}%` }} className="bg-emerald-500 h-full" title="Wins" />
                <div style={{ width: `${stats.totalGames > 0 ? (totalDraws / stats.totalGames) * 100 : 0}%` }} className="bg-amber-500 h-full" title="Draws" />
                <div style={{ width: `${stats.totalGames > 0 ? (totalLosses / stats.totalGames) * 100 : 0}%` }} className="bg-rose-500 h-full" title="Losses" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Wins ({totalWins})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Draws ({totalDraws})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Losses ({totalLosses})</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: OX Game Specific */}
        {activeTab === 'ox' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-blue-950/30 border border-blue-800/50 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-blue-200 text-base">OX Tic-Tac-Toe Record</h4>
                <p className="text-xs text-blue-300">Total Played: {stats.ox.played} matches</p>
              </div>
              <div className="text-2xl font-black text-blue-400">
                {oxWinRate}% Win Rate
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                <span className="text-xs text-slate-400 font-medium">OX Wins</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">{stats.ox.wins}</p>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                <span className="text-xs text-slate-400 font-medium">OX Losses</span>
                <p className="text-2xl font-black text-rose-400 mt-1">{stats.ox.losses}</p>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                <span className="text-xs text-slate-400 font-medium">OX Draws</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{stats.ox.draws}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: SOS Game Specific */}
        {activeTab === 'sos' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-purple-950/30 border border-purple-800/50 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-purple-200 text-base">SOS Strategy Record</h4>
                <p className="text-xs text-purple-300">Total Played: {stats.sos.played} matches</p>
              </div>
              <div className="text-2xl font-black text-purple-400">
                {sosWinRate}% Win Rate
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                <span className="text-xs text-slate-400 font-medium">SOS Wins</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">{stats.sos.wins}</p>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                <span className="text-xs text-slate-400 font-medium">SOS Losses</span>
                <p className="text-2xl font-black text-rose-400 mt-1">{stats.sos.losses}</p>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                <span className="text-xs text-slate-400 font-medium">SOS Draws</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{stats.sos.draws}</p>
              </div>
            </div>

            {/* Special SOS stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-gradient-to-br from-purple-900/40 to-slate-800 rounded-2xl border border-purple-700/40 flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl">
                  <Flame size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Total SOS Formations</div>
                  <div className="text-xl font-black text-purple-300">{stats.sos.totalSOSFormed}</div>
                </div>
              </div>

              <div className="p-3.5 bg-gradient-to-br from-pink-900/40 to-slate-800 rounded-2xl border border-pink-700/40 flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 text-pink-300 rounded-xl">
                  <Trophy size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Most SOS in 1 Game</div>
                  <div className="text-xl font-black text-pink-300">{stats.sos.maxSOSInOneGame}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button variant="secondary" className="w-full" size="md" onClick={onClose}>
            Back to Game
          </Button>
        </div>
      </div>
    </Modal>
  );
};
