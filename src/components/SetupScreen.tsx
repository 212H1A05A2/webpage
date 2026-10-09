import React from 'react';
import { GameType, GameMode, AIDifficulty, SOSBoardSize } from '../types';
import { Button } from './ui/Common';
import { ArrowLeft, Play, Bot, Users } from 'lucide-react';
import { sound } from '../services/sound';

interface SetupScreenProps {
  gameType: GameType;
  player1Name: string;
  onBack: () => void;
  onStartGame: (config: {
    gameType: GameType;
    mode: GameMode;
    p1Name: string;
    p2Name: string;
    aiDifficulty: AIDifficulty;
    boardSize: SOSBoardSize;
    firstPlayer: 'p1' | 'p2';
  }) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  gameType,
  player1Name,
  onBack,
  onStartGame,
}) => {
  const [mode, setMode] = React.useState<GameMode>('AI');
  const [p1Name, setP1Name] = React.useState<string>(player1Name || 'Player 1');
  const [p2Name, setP2Name] = React.useState<string>('Robo AI');
  const [difficulty, setDifficulty] = React.useState<AIDifficulty>('HARD');
  const [boardSize, setBoardSize] = React.useState<SOSBoardSize>(5);
  const [firstPlayer, setFirstPlayer] = React.useState<'p1' | 'p2'>('p1');

  React.useEffect(() => {
    if (mode === 'AI') {
      setP2Name(
        difficulty === 'EASY'
          ? 'Easy Bot 🤖'
          : difficulty === 'MEDIUM'
          ? 'Clever Bot 🧠'
          : 'Mastermind AI ⚡'
      );
    } else {
      if (p2Name.includes('Bot') || p2Name.includes('AI')) {
        setP2Name('Player 2');
      }
    }
  }, [mode, difficulty]);

  const handleStart = () => {
    sound.playClick();
    onStartGame({
      gameType,
      mode,
      p1Name: p1Name.trim() || 'Player 1',
      p2Name: p2Name.trim() || (mode === 'AI' ? 'Computer' : 'Player 2'),
      aiDifficulty: difficulty,
      boardSize,
      firstPlayer,
    });
  };

  const difficultyColors: Record<AIDifficulty, string> = {
    EASY: 'from-emerald-600 to-teal-600',
    MEDIUM: 'from-amber-600 to-orange-600',
    HARD: 'from-rose-600 to-red-600',
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 animate-pop-in">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 font-bold text-sm"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              gameType === 'OX' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'bg-purple-600/30 text-purple-400 border border-purple-500/30'
            }`}
          >
            {gameType === 'OX' ? 'OX Tic-Tac-Toe' : 'SOS Strategy'}
          </span>
        </div>
      </div>

      {/* Main Setup Card */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-black font-fredoka text-white tracking-wide">
            {gameType === 'OX' ? 'Setup OX Match' : 'Setup SOS Match'}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Configure opponents, board size, and game conditions.
          </p>
        </div>

        {/* Game Mode Selector (PVP vs AI) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Game Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setMode('AI');
                sound.playClick();
              }}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                mode === 'AI'
                  ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800/80'
              }`}
            >
              <Bot size={28} className={mode === 'AI' ? 'text-indigo-400 animate-wiggle' : ''} />
              <span className="font-extrabold text-sm sm:text-base">Player vs AI</span>
              <span className="text-[11px] text-slate-400 text-center">Solo challenge against computer</span>
            </button>

            <button
              onClick={() => {
                setMode('PVP');
                sound.playClick();
              }}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                mode === 'PVP'
                  ? 'border-pink-500 bg-pink-950/40 text-white shadow-lg shadow-pink-500/20 ring-1 ring-pink-500'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800/80'
              }`}
            >
              <Users size={28} className={mode === 'PVP' ? 'text-pink-400 animate-pulse-subtle' : ''} />
              <span className="font-extrabold text-sm sm:text-base">Pass & Play (2P)</span>
              <span className="text-[11px] text-slate-400 text-center">Local multiplayer on 1 device</span>
            </button>
          </div>
        </div>

        {/* AI Difficulty Selector (Only in AI Mode) */}
        {mode === 'AI' && (
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-2 animate-fade-in">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              AI Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['EASY', 'MEDIUM', 'HARD'] as AIDifficulty[]).map((diff) => {
                const isSelected = difficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => {
                      setDifficulty(diff);
                      sound.playClick();
                    }}
                    className={`py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all border cursor-pointer ${
                      isSelected
                        ? `bg-gradient-to-r ${difficultyColors[diff]} text-white border-transparent shadow-md`
                        : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {diff === 'EASY' && '🌱 Casual'}
                    {diff === 'MEDIUM' && '🧠 Medium'}
                    {diff === 'HARD' && '⚡ Master'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SOS Board Size Selector (Only in SOS Game) */}
        {gameType === 'SOS' && (
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-2 animate-fade-in">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              SOS Board Dimensions
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([3, 5, 7, 9] as SOSBoardSize[]).map((size) => {
                const isSelected = boardSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => {
                      setBoardSize(size);
                      sound.playClick();
                    }}
                    className={`py-3 rounded-xl font-black text-sm transition-all border flex flex-col items-center cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md ring-2 ring-purple-500/50'
                        : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{size}×{size}</span>
                    <span className="text-[10px] text-purple-300 font-normal mt-0.5">
                      {size === 3 ? 'Mini' : size === 5 ? 'Classic' : size === 7 ? 'Epic' : 'Giant'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Names & Turn Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Player 1 (You)</label>
            <input
              type="text"
              maxLength={14}
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
              placeholder="Player 1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">
              {mode === 'AI' ? 'AI Name' : 'Player 2'}
            </label>
            <input
              type="text"
              maxLength={14}
              value={p2Name}
              disabled={mode === 'AI'}
              onChange={(e) => setP2Name(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              placeholder="Player 2"
            />
          </div>
        </div>

        {/* First Move Selector */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Who Moves First?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setFirstPlayer('p1');
                sound.playClick();
              }}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                firstPlayer === 'p1'
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400'
              }`}
            >
              👑 {p1Name || 'Player 1'} Starts
            </button>
            <button
              onClick={() => {
                setFirstPlayer('p2');
                sound.playClick();
              }}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                firstPlayer === 'p2'
                  ? 'bg-pink-600/30 border-pink-500 text-pink-300'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400'
              }`}
            >
              🎯 {p2Name || 'Player 2'} Starts
            </button>
          </div>
        </div>

        {/* Start Game Button */}
        <div className="pt-2">
          <Button
            variant={gameType === 'OX' ? 'ox' : 'sos'}
            size="xl"
            className="w-full"
            icon={<Play size={22} className="fill-white" />}
            onClick={handleStart}
          >
            Start Match Now
          </Button>
        </div>
      </div>
    </div>
  );
};
