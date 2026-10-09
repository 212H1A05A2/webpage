import React from 'react';
import confetti from 'canvas-confetti';
import { GameMode, AIDifficulty, GameSettings, GameStats, UserProfile } from '../types';
import { OXGameState, createInitialOXState, makeOXMove } from '../engine/oxEngine';
import { getAIMove } from '../engine/oxAi';
import { Button, AvatarBadge } from './ui/Common';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { sound } from '../services/sound';
import { storage } from '../services/storage';

interface OXScreenProps {
  mode: GameMode;
  difficulty: AIDifficulty;
  p1Name: string;
  p2Name: string;
  firstPlayer: 'p1' | 'p2';
  userProfile: UserProfile;
  settings: GameSettings;
  onExit: () => void;
  onStatsUpdate: (stats: GameStats) => void;
}

export const OXScreen: React.FC<OXScreenProps> = ({
  mode,
  difficulty,
  p1Name,
  p2Name,
  firstPlayer,
  userProfile,
  onExit,
  onStatsUpdate,
}) => {
  // Player 1 is 'X', Player 2 (or AI) is 'O'
  const startingSymbol = firstPlayer === 'p1' ? 'X' : 'O';
  const [gameState, setGameState] = React.useState<OXGameState>(() => createInitialOXState(startingSymbol));
  const [matchScore, setMatchScore] = React.useState<{ p1: number; p2: number; draws: number }>({
    p1: 0,
    p2: 0,
    draws: 0,
  });
  const [isAiThinking, setIsAiThinking] = React.useState(false);
  const [showResultModal, setShowResultModal] = React.useState(false);

  const isHumanTurn = mode === 'PVP' || (mode === 'AI' && gameState.currentPlayer === 'X');

  // Trigger win confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }
  };

  // AI Move effect
  React.useEffect(() => {
    if (gameState.isGameOver) return;

    if (mode === 'AI' && gameState.currentPlayer === 'O') {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiIndex = getAIMove(gameState.board, 'O', difficulty);
        if (aiIndex >= 0) {
          handleCellClick(aiIndex, true);
        }
        setIsAiThinking(false);
      }, 450); // Small realistic delay

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.isGameOver, mode, difficulty]);

  // Handle Game Over scoring
  React.useEffect(() => {
    if (gameState.isGameOver && !showResultModal) {
      const timer = setTimeout(() => {
        setShowResultModal(true);
      }, 500);

      if (gameState.winner === 'X') {
        setMatchScore((s) => ({ ...s, p1: s.p1 + 1 }));
        sound.playWin();
        triggerConfetti();
        const updated = storage.recordOXResult(true, false, false);
        onStatsUpdate(updated);
        storage.addHistory({
          gameType: 'OX',
          mode,
          difficulty: mode === 'AI' ? difficulty : undefined,
          player1: p1Name,
          player2: p2Name,
          winner: p1Name,
          movesCount: gameState.moveHistory.length,
        });
      } else if (gameState.winner === 'O') {
        setMatchScore((s) => ({ ...s, p2: s.p2 + 1 }));
        if (mode === 'AI') {
          sound.playLoss();
          const updated = storage.recordOXResult(false, true, false);
          onStatsUpdate(updated);
        } else {
          sound.playWin();
          triggerConfetti();
          const updated = storage.recordOXResult(true, false, false);
          onStatsUpdate(updated);
        }
        storage.addHistory({
          gameType: 'OX',
          mode,
          difficulty: mode === 'AI' ? difficulty : undefined,
          player1: p1Name,
          player2: p2Name,
          winner: p2Name,
          movesCount: gameState.moveHistory.length,
        });
      } else if (gameState.winner === 'DRAW') {
        setMatchScore((s) => ({ ...s, draws: s.draws + 1 }));
        sound.playDraw();
        const updated = storage.recordOXResult(false, false, true);
        onStatsUpdate(updated);
        storage.addHistory({
          gameType: 'OX',
          mode,
          difficulty: mode === 'AI' ? difficulty : undefined,
          player1: p1Name,
          player2: p2Name,
          winner: 'DRAW',
          movesCount: gameState.moveHistory.length,
        });
      }

      return () => clearTimeout(timer);
    }
  }, [gameState.isGameOver]);

  const handleCellClick = (index: number, isAiTriggered = false) => {
    if (gameState.isGameOver) return;
    if (!isAiTriggered && !isHumanTurn) return;
    if (gameState.board[index] !== null) return;

    sound.playPlaceMove(gameState.currentPlayer);
    const result = makeOXMove(gameState, index);
    if (result.valid) {
      setGameState(result.state);
    }
  };

  const handleRestartMatch = () => {
    sound.playClick();
    setShowResultModal(false);
    setGameState(createInitialOXState('X'));
  };

  const handleResetScores = () => {
    sound.playClick();
    setMatchScore({ p1: 0, p2: 0, draws: 0 });
    handleRestartMatch();
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 flex flex-col items-center justify-between min-h-[85vh] animate-pop-in">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={() => {
            sound.playClick();
            onExit();
          }}
          className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 font-bold text-sm cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Exit</span>
        </button>

        <div className="text-center">
          <h2 className="text-xl font-black font-fredoka text-white tracking-wide">OX Tic-Tac-Toe</h2>
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
            {mode === 'AI' ? `vs ${difficulty} AI` : 'Pass & Play'}
          </span>
        </div>

        <button
          onClick={handleRestartMatch}
          title="Restart match"
          className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Scoreboard / Players Info */}
      <div className="w-full grid grid-cols-2 gap-3 mb-6">
        {/* Player 1 Card (X) */}
        <div
          className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${
            gameState.currentPlayer === 'X' && !gameState.isGameOver
              ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-500/20'
              : 'bg-slate-900/60 border-slate-800 opacity-80'
          }`}
        >
          <AvatarBadge avatar={userProfile.avatar} size="md" ringColor="ring-rose-500" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-white truncate">{p1Name}</span>
              <span className="px-1.5 py-0.2 bg-rose-500 text-white font-black text-[10px] rounded">X</span>
            </div>
            <div className="text-xl font-black text-rose-400">{matchScore.p1} pts</div>
          </div>
        </div>

        {/* Player 2 Card (O) */}
        <div
          className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${
            gameState.currentPlayer === 'O' && !gameState.isGameOver
              ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/20'
              : 'bg-slate-900/60 border-slate-800 opacity-80'
          }`}
        >
          <AvatarBadge avatar={mode === 'AI' ? '🤖' : '🐼'} size="md" ringColor="ring-blue-500" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-white truncate">{p2Name}</span>
              <span className="px-1.5 py-0.2 bg-blue-500 text-white font-black text-[10px] rounded">O</span>
            </div>
            <div className="text-xl font-black text-blue-400">{matchScore.p2} pts</div>
          </div>
        </div>
      </div>

      {/* Turn Indicator Banner */}
      <div className="w-full mb-4">
        <div className="py-2 px-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                gameState.currentPlayer === 'X' ? 'bg-rose-500 animate-ping' : 'bg-blue-500 animate-ping'
              }`}
            />
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              {isAiThinking
                ? 'AI is calculating move...'
                : gameState.currentPlayer === 'X'
                ? `${p1Name}'s Turn (X)`
                : `${p2Name}'s Turn (O)`}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400">Draws: {matchScore.draws}</span>
        </div>
      </div>

      {/* 3x3 Game Board Container */}
      <div className="relative p-3 sm:p-4 bg-slate-950 rounded-3xl border-2 border-slate-800 shadow-2xl w-full max-w-sm aspect-square flex items-center justify-center">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full h-full">
          {gameState.board.map((symbol, index) => {
            const isWinningCell = gameState.winningLine?.pattern.includes(index as any);
            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={symbol !== null || gameState.isGameOver || (mode === 'AI' && gameState.currentPlayer === 'O')}
                aria-label={`Board cell ${index + 1}`}
                className={`rounded-2xl flex items-center justify-center font-black text-4xl sm:text-5xl transition-all duration-200 cursor-pointer select-none active:scale-90 ${
                  symbol === null
                    ? 'bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/50'
                    : isWinningCell
                    ? symbol === 'X'
                      ? 'bg-rose-600/40 border-2 border-rose-500 text-rose-300 ring-4 ring-rose-500/50 scale-105 shadow-lg shadow-rose-500/30'
                      : 'bg-blue-600/40 border-2 border-blue-500 text-blue-300 ring-4 ring-blue-500/50 scale-105 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-900 border border-slate-800'
                }`}
              >
                {symbol && (
                  <span
                    className={`animate-pop-in ${
                      symbol === 'X' ? 'text-rose-500' : 'text-blue-400'
                    }`}
                  >
                    {symbol}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="w-full flex items-center gap-3 mt-6">
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          icon={<RotateCcw size={16} />}
          onClick={handleRestartMatch}
        >
          New Round
        </Button>
        <Button
          variant="outline"
          size="md"
          className="text-xs"
          onClick={handleResetScores}
        >
          Reset Scores
        </Button>
      </div>

      {/* Game Result Modal Popup */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center animate-pop-in space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-3xl">
              {gameState.winner === 'DRAW' ? '🤝' : gameState.winner === 'X' ? '🏆' : mode === 'AI' ? '🤖' : '🎉'}
            </div>

            <div>
              <h3 className="text-2xl font-black font-fredoka text-white">
                {gameState.winner === 'DRAW'
                  ? 'Match Drawn!'
                  : gameState.winner === 'X'
                  ? `${p1Name} Wins!`
                  : `${p2Name} Wins!`}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {gameState.winner === 'DRAW'
                  ? 'Evenly matched, no player was able to connect 3 in a row!'
                  : gameState.winner === 'X'
                  ? 'Incredible strategy and perfect line connection!'
                  : 'Well played round!'}
              </p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 flex justify-around text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{p1Name}</span>
                <p className="text-lg font-black text-rose-400">{matchScore.p1}</p>
              </div>
              <div className="border-r border-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Draws</span>
                <p className="text-lg font-black text-slate-300">{matchScore.draws}</p>
              </div>
              <div className="border-r border-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{p2Name}</span>
                <p className="text-lg font-black text-blue-400">{matchScore.p2}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="ox"
                size="lg"
                className="w-full"
                icon={<RotateCcw size={18} />}
                onClick={handleRestartMatch}
              >
                Play Another Round
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-400 hover:text-white"
                onClick={() => {
                  setShowResultModal(false);
                  onExit();
                }}
              >
                Back to Home Menu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
