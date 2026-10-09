import { OXSymbol } from '../types';

export type OXBoard = (OXSymbol | null)[];

export interface OXWinningLine {
  pattern: [number, number, number];
  type: 'horizontal' | 'vertical' | 'diagonal-main' | 'diagonal-anti';
  lineIndex: number;
}

export interface OXGameState {
  board: OXBoard;
  currentPlayer: OXSymbol;
  winner: OXSymbol | 'DRAW' | null;
  winningLine: OXWinningLine | null;
  isGameOver: boolean;
  moveHistory: { index: number; symbol: OXSymbol }[];
}

export const WINNING_PATTERNS: { pattern: [number, number, number]; type: OXWinningLine['type']; lineIndex: number }[] = [
  // Rows
  { pattern: [0, 1, 2], type: 'horizontal', lineIndex: 0 },
  { pattern: [3, 4, 5], type: 'horizontal', lineIndex: 1 },
  { pattern: [6, 7, 8], type: 'horizontal', lineIndex: 2 },
  // Columns
  { pattern: [0, 3, 6], type: 'vertical', lineIndex: 0 },
  { pattern: [1, 4, 7], type: 'vertical', lineIndex: 1 },
  { pattern: [2, 5, 8], type: 'vertical', lineIndex: 2 },
  // Diagonals
  { pattern: [0, 4, 8], type: 'diagonal-main', lineIndex: 0 },
  { pattern: [2, 4, 6], type: 'diagonal-anti', lineIndex: 1 },
];

export function createInitialOXState(startingPlayer: OXSymbol = 'X'): OXGameState {
  return {
    board: Array(9).fill(null),
    currentPlayer: startingPlayer,
    winner: null,
    winningLine: null,
    isGameOver: false,
    moveHistory: [],
  };
}

export function checkOXWinner(board: OXBoard): { winner: OXSymbol | null; winningLine: OXWinningLine | null } {
  for (const win of WINNING_PATTERNS) {
    const [a, b, c] = win.pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningLine: win,
      };
    }
  }
  return { winner: null, winningLine: null };
}

export function isOXBoardFull(board: OXBoard): boolean {
  return board.every((cell) => cell !== null);
}

export function makeOXMove(state: OXGameState, index: number): { state: OXGameState; valid: boolean; error?: string } {
  if (state.isGameOver) {
    return { state, valid: false, error: 'Game is already over' };
  }
  if (index < 0 || index >= 9) {
    return { state, valid: false, error: 'Invalid cell index' };
  }
  if (state.board[index] !== null) {
    return { state, valid: false, error: 'Cell already occupied' };
  }

  const newBoard = [...state.board];
  newBoard[index] = state.currentPlayer;

  const { winner, winningLine } = checkOXWinner(newBoard);
  const isFull = isOXBoardFull(newBoard);
  const isGameOver = Boolean(winner) || isFull;
  const gameWinner = winner ? winner : isFull ? 'DRAW' : null;

  const nextPlayer: OXSymbol = state.currentPlayer === 'X' ? 'O' : 'X';

  const newState: OXGameState = {
    board: newBoard,
    currentPlayer: isGameOver ? state.currentPlayer : nextPlayer,
    winner: gameWinner,
    winningLine,
    isGameOver,
    moveHistory: [...state.moveHistory, { index, symbol: state.currentPlayer }],
  };

  return { state: newState, valid: true };
}
