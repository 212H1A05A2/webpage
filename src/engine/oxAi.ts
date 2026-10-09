import { AIDifficulty, OXSymbol } from '../types';
import { OXBoard, checkOXWinner, isOXBoardFull } from './oxEngine';

/**
 * Minimax algorithm for unbeatable AI
 */
function minimax(
  board: OXBoard,
  depth: number,
  isMaximizing: boolean,
  aiSymbol: OXSymbol,
  humanSymbol: OXSymbol,
  alpha = -1000,
  beta = 1000
): { score: number; index?: number } {
  const { winner } = checkOXWinner(board);
  if (winner === aiSymbol) return { score: 10 - depth };
  if (winner === humanSymbol) return { score: depth - 10 };
  if (isOXBoardFull(board)) return { score: 0 };

  const availableMoves: number[] = [];
  board.forEach((cell, idx) => {
    if (cell === null) availableMoves.push(idx);
  });

  if (isMaximizing) {
    let maxScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = aiSymbol;
      const result = minimax(board, depth + 1, false, aiSymbol, humanSymbol, alpha, beta);
      board[move] = null;

      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, maxScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return { score: maxScore, index: bestMove };
  } else {
    let minScore = Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = humanSymbol;
      const result = minimax(board, depth + 1, true, aiSymbol, humanSymbol, alpha, beta);
      board[move] = null;

      if (result.score < minScore) {
        minScore = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, minScore);
      if (beta <= alpha) break;
    }
    return { score: minScore, index: bestMove };
  }
}

/**
 * Get available empty cells
 */
export function getAvailableOXMoves(board: OXBoard): number[] {
  const moves: number[] = [];
  board.forEach((val, idx) => {
    if (val === null) moves.push(idx);
  });
  return moves;
}

/**
 * Find winning or blocking move for medium AI
 */
function findTacticalMove(board: OXBoard, symbol: OXSymbol): number | null {
  const emptyIndices = getAvailableOXMoves(board);
  for (const idx of emptyIndices) {
    board[idx] = symbol;
    const { winner } = checkOXWinner(board);
    board[idx] = null;
    if (winner === symbol) return idx;
  }
  return null;
}

/**
 * Compute AI Move based on difficulty
 */
export function getAIMove(
  board: OXBoard,
  aiSymbol: OXSymbol,
  difficulty: AIDifficulty
): number {
  const availableMoves = getAvailableOXMoves(board);
  if (availableMoves.length === 0) return -1;

  const humanSymbol: OXSymbol = aiSymbol === 'X' ? 'O' : 'X';

  // 1. Easy: Purely random
  if (difficulty === 'EASY') {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // 2. Medium: 60% Minimax / Win / Block, 40% Random
  if (difficulty === 'MEDIUM') {
    // 1st priority: Take winning move if available
    const winMove = findTacticalMove(board, aiSymbol);
    if (winMove !== null) return winMove;

    // 2nd priority: Block opponent win
    const blockMove = findTacticalMove(board, humanSymbol);
    if (blockMove !== null) return blockMove;

    // 3rd: 50% chance optimal minimax, 50% random or center
    if (Math.random() > 0.4) {
      if (board[4] === null) return 4; // Center
      const result = minimax(board, 0, true, aiSymbol, humanSymbol);
      if (result.index !== undefined) return result.index;
    }

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // 3. Hard: Minimax (Unbeatable) with optimal opening variations
  if (difficulty === 'HARD') {
    // If board is totally empty, pick center or a corner for variety
    if (availableMoves.length === 9) {
      const openings = [0, 2, 4, 6, 8];
      return openings[Math.floor(Math.random() * openings.length)];
    }

    const boardCopy = [...board];
    const result = minimax(boardCopy, 0, true, aiSymbol, humanSymbol);
    return result.index !== undefined ? result.index : availableMoves[0];
  }

  return availableMoves[0];
}
