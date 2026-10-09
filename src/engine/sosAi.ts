import { AIDifficulty, SOSBoardSize, SOSSymbol } from '../types';
import { SOSBoard, SOSLine, checkNewSOSLines } from './sosEngine';

export interface SOSAIMove {
  index: number;
  symbol: SOSSymbol;
}

export function getAvailableSOSMoves(board: SOSBoard): number[] {
  const moves: number[] = [];
  board.forEach((val, idx) => {
    if (val === null) moves.push(idx);
  });
  return moves;
}

/**
 * Evaluates how dangerous placing a symbol at `index` is (i.e. whether it hands an easy SOS to opponent)
 */
function movesCreatedIfOpponentPlays(
  board: SOSBoard,
  size: SOSBoardSize,
  existingLines: SOSLine[]
): number {
  let opponentOpportunities = 0;
  const empty = getAvailableSOSMoves(board);
  for (const idx of empty) {
    for (const sym of ['S', 'O'] as SOSSymbol[]) {
      board[idx] = sym;
      const lines = checkNewSOSLines(board, size, idx, sym, 'p2', existingLines);
      board[idx] = null;
      if (lines.length > 0) {
        opponentOpportunities += lines.length;
      }
    }
  }
  return opponentOpportunities;
}

/**
 * Intelligent SOS AI that looks for scoring opportunities, avoids giving away easy SOS,
 * and plays strategically.
 */
export function getSOSAIMove(
  board: SOSBoard,
  size: SOSBoardSize,
  existingLines: SOSLine[],
  difficulty: AIDifficulty
): SOSAIMove {
  const availableIndices = getAvailableSOSMoves(board);
  if (availableIndices.length === 0) {
    return { index: 0, symbol: 'S' };
  }

  // 1. EASY AI: Random cell + random symbol
  if (difficulty === 'EASY') {
    const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const randomSym: SOSSymbol = Math.random() > 0.5 ? 'S' : 'O';
    return { index: randomIdx, symbol: randomSym };
  }

  // Find all immediate scoring moves
  const scoringMoves: { index: number; symbol: SOSSymbol; score: number }[] = [];

  for (const idx of availableIndices) {
    for (const sym of ['S', 'O'] as SOSSymbol[]) {
      board[idx] = sym;
      const newLines = checkNewSOSLines(board, size, idx, sym, 'p2', existingLines);
      board[idx] = null;

      if (newLines.length > 0) {
        scoringMoves.push({ index: idx, symbol: sym, score: newLines.length });
      }
    }
  }

  // If there are scoring moves, sort by highest score created (combo multiplier!)
  if (scoringMoves.length > 0) {
    scoringMoves.sort((a, b) => b.score - a.score);
    // On medium, 80% chance to take scoring move, 20% random error
    if (difficulty === 'MEDIUM' && Math.random() < 0.2) {
      // Small slip
    } else {
      return { index: scoringMoves[0].index, symbol: scoringMoves[0].symbol };
    }
  }

  // If no scoring move available, evaluate safest moves that DO NOT give opponent an easy SOS
  const safeMoves: { index: number; symbol: SOSSymbol; opponentThreats: number }[] = [];

  for (const idx of availableIndices) {
    for (const sym of ['S', 'O'] as SOSSymbol[]) {
      board[idx] = sym;
      const threats = movesCreatedIfOpponentPlays(board, size, existingLines);
      board[idx] = null;
      safeMoves.push({ index: idx, symbol: sym, opponentThreats: threats });
    }
  }

  // Sort by lowest threat to opponent
  safeMoves.sort((a, b) => a.opponentThreats - b.opponentThreats);

  if (difficulty === 'HARD') {
    // Pick the safest move with lowest threat
    const minThreat = safeMoves[0].opponentThreats;
    const bestSafeMoves = safeMoves.filter((m) => m.opponentThreats === minThreat);
    const chosen = bestSafeMoves[Math.floor(Math.random() * bestSafeMoves.length)];
    return { index: chosen.index, symbol: chosen.symbol };
  }

  // MEDIUM: Pick from top 5 safest moves
  const topSlice = safeMoves.slice(0, Math.min(5, safeMoves.length));
  const chosen = topSlice[Math.floor(Math.random() * topSlice.length)];
  return { index: chosen.index, symbol: chosen.symbol };
}
