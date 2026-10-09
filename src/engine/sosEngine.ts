import { SOSBoardSize, SOSSymbol } from '../types';

export type SOSBoard = (SOSSymbol | null)[];

export interface SOSLine {
  id: string; // Unique identifier for line
  coords: [number, number, number]; // 3 board indices [S, O, S]
  direction: 'horizontal' | 'vertical' | 'diagonal-main' | 'diagonal-anti';
  playerId: string; // Player who completed this SOS
  color?: string;
}

export interface SOSGameState {
  boardSize: SOSBoardSize;
  board: SOSBoard;
  currentTurn: 'p1' | 'p2';
  scores: { p1: number; p2: number };
  sosLines: SOSLine[];
  lastCreatedLines: SOSLine[];
  isGameOver: boolean;
  winner: 'p1' | 'p2' | 'DRAW' | null;
  moveHistory: { index: number; symbol: SOSSymbol; playerId: 'p1' | 'p2'; createdSosCount: number }[];
}

export function createInitialSOSState(boardSize: SOSBoardSize = 5, startingTurn: 'p1' | 'p2' = 'p1'): SOSGameState {
  return {
    boardSize,
    board: Array(boardSize * boardSize).fill(null),
    currentTurn: startingTurn,
    scores: { p1: 0, p2: 0 },
    sosLines: [],
    lastCreatedLines: [],
    isGameOver: false,
    winner: null,
    moveHistory: [],
  };
}

export function indexToCoord(index: number, size: number): { r: number; c: number } {
  return {
    r: Math.floor(index / size),
    c: index % size,
  };
}

export function coordToIndex(r: number, c: number, size: number): number {
  return r * size + c;
}

/**
 * Check for any newly formed SOS lines created by placing `symbol` at `index`.
 * An SOS is formed if:
 * 1. Placed symbol is 'O' and adjacent cells in opposite directions are 'S' and 'S' (i.e. S - O(new) - S).
 * 2. Placed symbol is 'S' and next cell is 'O' and cell after is 'S' (i.e. S(new) - O - S or S - O - S(new)).
 */
export function checkNewSOSLines(
  board: SOSBoard,
  size: number,
  placedIndex: number,
  symbol: SOSSymbol,
  playerId: 'p1' | 'p2',
  existingLines: SOSLine[]
): SOSLine[] {
  const { r, c } = indexToCoord(placedIndex, size);
  const newLines: SOSLine[] = [];

  const existingLineIds = new Set(existingLines.map((l) => l.coords.sort().join('-')));

  const addLineIfValid = (
    s1: { r: number; c: number },
    o: { r: number; c: number },
    s2: { r: number; c: number },
    direction: SOSLine['direction']
  ) => {
    // Check bounds
    if (
      s1.r < 0 || s1.r >= size || s1.c < 0 || s1.c >= size ||
      o.r < 0 || o.r >= size || o.c < 0 || o.c >= size ||
      s2.r < 0 || s2.r >= size || s2.c < 0 || s2.c >= size
    ) {
      return;
    }

    const idxS1 = coordToIndex(s1.r, s1.c, size);
    const idxO = coordToIndex(o.r, o.c, size);
    const idxS2 = coordToIndex(s2.r, s2.c, size);

    const symbolS1 = idxS1 === placedIndex ? symbol : board[idxS1];
    const symbolO = idxO === placedIndex ? symbol : board[idxO];
    const symbolS2 = idxS2 === placedIndex ? symbol : board[idxS2];

    if (symbolS1 === 'S' && symbolO === 'O' && symbolS2 === 'S') {
      const lineCoords: [number, number, number] = [idxS1, idxO, idxS2];
      const lineKey = [...lineCoords].sort().join('-');
      if (!existingLineIds.has(lineKey)) {
        existingLineIds.add(lineKey);
        newLines.push({
          id: `sos_${idxS1}_${idxO}_${idxS2}_${Date.now()}`,
          coords: lineCoords,
          direction,
          playerId,
        });
      }
    }
  };

  // 8 directions as delta pairs: [dr, dc]
  const directions: { dir: SOSLine['direction']; dr: number; dc: number }[] = [
    { dir: 'horizontal', dr: 0, dc: 1 },
    { dir: 'vertical', dr: 1, dc: 0 },
    { dir: 'diagonal-main', dr: 1, dc: 1 }, // \ diagonal
    { dir: 'diagonal-anti', dr: 1, dc: -1 }, // / diagonal
  ];

  if (symbol === 'O') {
    // O is the middle: check S in opposite directions (dr, dc) and (-dr, -dc)
    for (const { dir, dr, dc } of directions) {
      const s1 = { r: r - dr, c: c - dc };
      const s2 = { r: r + dr, c: c + dc };
      addLineIfValid(s1, { r, c }, s2, dir);
    }
  } else if (symbol === 'S') {
    // S could be the start or the end of SOS
    for (const { dir, dr, dc } of directions) {
      // 1. S(placed) -> O(r+dr, c+dc) -> S(r+2dr, c+2dc)
      const o1 = { r: r + dr, c: c + dc };
      const sEnd1 = { r: r + 2 * dr, c: c + 2 * dc };
      addLineIfValid({ r, c }, o1, sEnd1, dir);

      // 2. S(placed) <- O(r-dr, c-dc) <- S(r-2dr, c-2dc)
      const o2 = { r: r - dr, c: c - dc };
      const sEnd2 = { r: r - 2 * dr, c: c - 2 * dc };
      addLineIfValid(sEnd2, o2, { r, c }, dir);
    }
  }

  return newLines;
}

export function isSOSBoardFull(board: SOSBoard): boolean {
  return board.every((cell) => cell !== null);
}

export function makeSOSMove(
  state: SOSGameState,
  index: number,
  symbol: SOSSymbol
): { state: SOSGameState; valid: boolean; formedSOSCount: number; error?: string } {
  if (state.isGameOver) {
    return { state, valid: false, formedSOSCount: 0, error: 'Game is already over' };
  }
  if (index < 0 || index >= state.board.length) {
    return { state, valid: false, formedSOSCount: 0, error: 'Invalid cell index' };
  }
  if (state.board[index] !== null) {
    return { state, valid: false, formedSOSCount: 0, error: 'Cell is already occupied' };
  }

  const newBoard = [...state.board];
  newBoard[index] = symbol;

  const currentTurn = state.currentTurn;
  const newCreatedLines = checkNewSOSLines(
    newBoard,
    state.boardSize,
    index,
    symbol,
    currentTurn,
    state.sosLines
  );

  const formedCount = newCreatedLines.length;
  const newScores = {
    ...state.scores,
    [currentTurn]: state.scores[currentTurn] + formedCount,
  };

  const isFull = isSOSBoardFull(newBoard);

  // In SOS: If player created at least 1 SOS, they GET AN EXTRA TURN!
  // If no SOS was formed, turn switches.
  const nextTurn: 'p1' | 'p2' = formedCount > 0 ? currentTurn : currentTurn === 'p1' ? 'p2' : 'p1';

  let winner: 'p1' | 'p2' | 'DRAW' | null = null;
  let isGameOver = false;

  if (isFull) {
    isGameOver = true;
    if (newScores.p1 > newScores.p2) {
      winner = 'p1';
    } else if (newScores.p2 > newScores.p1) {
      winner = 'p2';
    } else {
      winner = 'DRAW';
    }
  }

  const newState: SOSGameState = {
    ...state,
    board: newBoard,
    currentTurn: isGameOver ? currentTurn : nextTurn,
    scores: newScores,
    sosLines: [...state.sosLines, ...newCreatedLines],
    lastCreatedLines: newCreatedLines,
    isGameOver,
    winner,
    moveHistory: [
      ...state.moveHistory,
      {
        index,
        symbol,
        playerId: currentTurn,
        createdSosCount: formedCount,
      },
    ],
  };

  return { state: newState, valid: true, formedSOSCount: formedCount };
}
