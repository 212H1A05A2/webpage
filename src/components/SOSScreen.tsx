import React from 'react';
import confetti from 'canvas-confetti';
import { GameMode, AIDifficulty, SOSBoardSize, SOSSymbol, GameSettings, GameStats, UserProfile } from '../types';
import { SOSGameState, createInitialSOSState, makeSOSMove, indexToCoord } from '../engine/sosEngine';
import { getSOSAIMove } from '../engine/sosAi';
import { Button, AvatarBadge } from './ui/Common';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { sound } from '../services/sound';
import { storage } from '../services/storage';

interface SOSScreenProps {
  mode: GameMode;
  difficulty: AIDifficulty;
  boardSize: SOSBoardSize;
  p1Name: string;
  p2Name: string;
  firstPlayer: 'p1' | 'p2';
  userProfile: UserProfile;
  settings: GameSettings;
  onExit: () => void;
  onStatsUpdate: (stats: GameStats) => void;
}

export const SOSScreen: React.FC<SOSScreenProps> = ({
  mode,
  difficulty,
  boardSize,
  p1Name,
  p2Name,
  firstPlayer,
  userProfile,
  onExit,
  onStatsUpdate,
}) => {
  const [gameState, setGameState] = React.useState<SOSGameState>(() =>
    createInitialSOSState(boardSize, firstPlayer)
  );
  const [selectedSymbol, setSelectedSymbol] = React.useState<SOSSymbol>('S');
  const [isAiThinking, setIsAiThinking] = React.useState(false);
  const [showResultModal, setShowResultModal] = React.useState(false);
  const [recentComboBanner, setRecentComboBanner] = React.useState<string | null>(null);

  const isHumanTurn = mode === 'PVP' || (mode === 'AI' && gameState.currentTurn === 'p1');

  // Trigger win confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }
  };

  // AI Turn handler
  React.useEffect(() => {
    if (gameState.isGameOver) return;

    if (mode === 'AI' && gameState.currentTurn === 'p2') {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const move = getSOSAIMove(gameState.board, gameState.boardSize, gameState.sosLines, difficulty);
        executeMove(move.index, move.symbol, true);
        setIsAiThinking(false);
      }, 550);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurn, gameState.isGameOver, mode, difficulty, gameState.sosLines]);

  // Handle Game Over
  React.useEffect(() => {
    if (gameState.isGameOver && !showResultModal) {
      const timer = setTimeout(() => {
        setShowResultModal(true);
      }, 600);

      const totalSosInGame = gameState.sosLines.length;

      if (gameState.winner === 'p1') {
        sound.playWin();
        triggerConfetti();
        const updated = storage.recordSOSResult(true, false, false, totalSosInGame);
        onStatsUpdate(updated);
        storage.addHistory({
          gameType: 'SOS',
          mode,
          difficulty: mode === 'AI' ? difficulty : undefined,
          boardSize,
          player1: p1Name,
          player2: p2Name,
          winner: p1Name,
          score: { p1: gameState.scores.p1, p2: gameState.scores.p2 },
          movesCount: gameState.moveHistory.length,
        });
      } else if (gameState.winner === 'p2') {
        if (mode === 'AI') {
          sound.playLoss();
          const updated = storage.recordSOSResult(false, true, false, totalSosInGame);
          onStatsUpdate(updated);
        } else {
          sound.playWin();
          triggerConfetti();
          const updated = storage.recordSOSResult(true, false, false, totalSosInGame);
          onStatsUpdate(updated);
        }
        storage.addHistory({
          gameType: 'SOS',
          mode,
          difficulty: mode === 'AI' ? difficulty : undefined,
          boardSize,
          player1: p1Name,
          player2: p2Name,
          winner: p2Name,
          score: { p1: gameState.scores.p1, p2: gameState.scores.p2 },
          movesCount: gameState.moveHistory.length,
        });
      } else if (gameState.winner === 'DRAW') {
        sound.playDraw();
        const updated = storage.recordSOSResult(false, false, true, totalSosInGame);
        onStatsUpdate(updated);
        storage.addHistory({
          gameType: 'SOS',
          mode,
          difficulty: mode === 'AI' ? difficulty : undefined,
          boardSize,
          player1: p1Name,
          player2: p2Name,
          winner: 'DRAW',
          score: { p1: gameState.scores.p1, p2: gameState.scores.p2 },
          movesCount: gameState.moveHistory.length,
        });
      }

      return () => clearTimeout(timer);
    }
  }, [gameState.isGameOver]);

  const executeMove = (index: number, symbol: SOSSymbol, isAi = false) => {
    if (gameState.isGameOver) return;
    if (!isAi && !isHumanTurn) return;
    if (gameState.board[index] !== null) return;

    sound.playPlaceMove(symbol);
    const result = makeSOSMove(gameState, index, symbol);

    if (result.valid) {
      if (result.formedSOSCount > 0) {
        if (result.formedSOSCount > 1) {
          sound.playCombo();
          setRecentComboBanner(`🔥 COMBO! +${result.formedSOSCount} SOS formed! Extra Turn!`);
        } else {
          sound.playSosCreated();
          setRecentComboBanner(`✨ SOS formed! Extra Turn!`);
        }
        setTimeout(() => setRecentComboBanner(null), 2500);
      }
      setGameState(result.state);
    }
  };

  const handleCellClick = (index: number) => {
    executeMove(index, selectedSymbol, false);
  };

  const handleRestart = () => {
    sound.playClick();
    setShowResultModal(false);
    setGameState(createInitialSOSState(boardSize, 'p1'));
  };

  // Helper to test if a cell is part of any SOS line
  const getCellLineHighlight = (index: number) => {
    const linesPassingThrough = gameState.sosLines.filter((l) => l.coords.includes(index));
    return linesPassingThrough;
  };

  // Grid column class mapper
  const gridColsClass = {
    3: 'grid-cols-3',
    5: 'grid-cols-5',
    7: 'grid-cols-7',
    9: 'grid-cols-9',
  }[boardSize];

  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-5 flex flex-col items-center justify-between min-h-[85vh] animate-pop-in">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-3">
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
          <h2 className="text-xl font-black font-fredoka text-white tracking-wide">
            SOS ({boardSize}×{boardSize})
          </h2>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            {mode === 'AI' ? `vs ${difficulty} AI` : 'Pass & Play'}
          </span>
        </div>

        <button
          onClick={handleRestart}
          title="Restart match"
          className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Players Score Board */}
      <div className="w-full grid grid-cols-2 gap-3 mb-4">
        {/* Player 1 Card */}
        <div
          className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
            gameState.currentTurn === 'p1' && !gameState.isGameOver
              ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20'
              : 'bg-slate-900/60 border-slate-800 opacity-80'
          }`}
        >
          <AvatarBadge avatar={userProfile.avatar} size="md" ringColor="ring-purple-500" />
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-xs sm:text-sm text-white truncate">{p1Name}</div>
            <div className="text-xl font-black text-purple-400">{gameState.scores.p1} pts</div>
          </div>
        </div>

        {/* Player 2 Card */}
        <div
          className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
            gameState.currentTurn === 'p2' && !gameState.isGameOver
              ? 'bg-pink-950/40 border-pink-500 ring-2 ring-pink-500/40 shadow-lg shadow-pink-500/20'
              : 'bg-slate-900/60 border-slate-800 opacity-80'
          }`}
        >
          <AvatarBadge avatar={mode === 'AI' ? '🤖' : '🐼'} size="md" ringColor="ring-pink-500" />
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-xs sm:text-sm text-white truncate">{p2Name}</div>
            <div className="text-xl font-black text-pink-400">{gameState.scores.p2} pts</div>
          </div>
        </div>
      </div>

      {/* Turn & S/O Selector bar */}
      <div className="w-full space-y-2 mb-3">
        {/* Combo / Extra turn alert banner */}
        {recentComboBanner && (
          <div className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-center text-xs sm:text-sm shadow-lg animate-bounce">
            {recentComboBanner}
          </div>
        )}

        <div className="py-2 px-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                gameState.currentTurn === 'p1' ? 'bg-purple-500 animate-ping' : 'bg-pink-500 animate-ping'
              }`}
            />
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              {isAiThinking
                ? 'AI is calculating move...'
                : gameState.currentTurn === 'p1'
                ? `${p1Name}'s Turn`
                : `${p2Name}'s Turn`}
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Total SOS: {gameState.sosLines.length}
          </span>
        </div>

        {/* Symbol Selector (S or O) */}
        <div className="p-2 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 pl-2">Next Symbol to Place:</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedSymbol('S');
                sound.playClick();
              }}
              className={`px-5 py-1.5 rounded-xl font-black text-lg transition-all cursor-pointer ${
                selectedSymbol === 'S'
                  ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400 scale-105'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              S
            </button>
            <button
              onClick={() => {
                setSelectedSymbol('O');
                sound.playClick();
              }}
              className={`px-5 py-1.5 rounded-xl font-black text-lg transition-all cursor-pointer ${
                selectedSymbol === 'O'
                  ? 'bg-pink-600 text-white shadow-lg ring-2 ring-pink-400 scale-105'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              O
            </button>
          </div>
        </div>
      </div>

      {/* SOS Game Board Container */}
      <div className="relative p-2.5 sm:p-4 bg-slate-950 rounded-3xl border-2 border-slate-800 shadow-2xl w-full max-w-md aspect-square flex items-center justify-center overflow-hidden">
        {/* SVG Overlay to render exact connecting lines across SOS formations */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          style={{ padding: '16px' }}
        >
          {gameState.sosLines.map((line, idx) => {
            const startCoord = indexToCoord(line.coords[0], boardSize);
            const endCoord = indexToCoord(line.coords[2], boardSize);

            // Compute percentage positions
            const cellPercent = 100 / boardSize;
            const x1 = `${(startCoord.c + 0.5) * cellPercent}%`;
            const y1 = `${(startCoord.r + 0.5) * cellPercent}%`;
            const x2 = `${(endCoord.c + 0.5) * cellPercent}%`;
            const y2 = `${(endCoord.r + 0.5) * cellPercent}%`;

            const strokeColor = line.playerId === 'p1' ? '#a855f7' : '#ec4899';

            return (
              <line
                key={line.id || idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={boardSize >= 7 ? '3' : '4'}
                strokeLinecap="round"
                className="animate-pop-in"
                strokeDasharray={line.playerId === 'p1' ? 'none' : '6 4'}
              />
            );
          })}
        </svg>

        {/* Board Cells Grid */}
        <div className={`grid ${gridColsClass} gap-1.5 sm:gap-2 w-full h-full relative z-10`}>
          {gameState.board.map((symbol, index) => {
            const linesThrough = getCellLineHighlight(index);
            const isHighlight = linesThrough.length > 0;
            const hasP1Line = linesThrough.some((l) => l.playerId === 'p1');
            const hasP2Line = linesThrough.some((l) => l.playerId === 'p2');

            const fontSizeClass =
              boardSize === 3
                ? 'text-4xl sm:text-5xl'
                : boardSize === 5
                ? 'text-2xl sm:text-3xl'
                : boardSize === 7
                ? 'text-lg sm:text-xl'
                : 'text-sm sm:text-base';

            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={symbol !== null || gameState.isGameOver || (mode === 'AI' && gameState.currentTurn === 'p2')}
                aria-label={`SOS cell ${index + 1}`}
                className={`rounded-xl sm:rounded-2xl flex items-center justify-center font-black ${fontSizeClass} transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                  symbol === null
                    ? 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
                    : isHighlight
                    ? hasP1Line && hasP2Line
                      ? 'bg-gradient-to-br from-purple-900/60 to-pink-900/60 border border-amber-400 text-white font-extrabold shadow-md'
                      : hasP1Line
                      ? 'bg-purple-950/70 border border-purple-500/60 text-purple-300 font-extrabold'
                      : 'bg-pink-950/70 border border-pink-500/60 text-pink-300 font-extrabold'
                    : 'bg-slate-900 border border-slate-800 text-slate-300'
                }`}
              >
                {symbol && (
                  <span
                    className={`animate-pop-in ${
                      symbol === 'S' ? 'text-purple-400' : 'text-pink-400'
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

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center animate-pop-in space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-3xl">
              {gameState.winner === 'DRAW' ? '🤝' : gameState.winner === 'p1' ? '🏆' : mode === 'AI' ? '🤖' : '🎉'}
            </div>

            <div>
              <h3 className="text-2xl font-black font-fredoka text-white">
                {gameState.winner === 'DRAW'
                  ? 'Tied Game!'
                  : gameState.winner === 'p1'
                  ? `${p1Name} Wins!`
                  : `${p2Name} Wins!`}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {gameState.winner === 'DRAW'
                  ? `Both players formed equal SOS combinations!`
                  : gameState.winner === 'p1'
                  ? `Dominated with ${gameState.scores.p1} SOS combinations!`
                  : `Mastered the board with ${gameState.scores.p2} SOS formations!`}
              </p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 flex justify-around text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{p1Name}</span>
                <p className="text-xl font-black text-purple-400">{gameState.scores.p1} pts</p>
              </div>
              <div className="border-r border-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total SOS</span>
                <p className="text-xl font-black text-amber-400">{gameState.sosLines.length}</p>
              </div>
              <div className="border-r border-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{p2Name}</span>
                <p className="text-xl font-black text-pink-400">{gameState.scores.p2} pts</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="sos"
                size="lg"
                className="w-full"
                icon={<RotateCcw size={18} />}
                onClick={handleRestart}
              >
                Play Rematch
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
