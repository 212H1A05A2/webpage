import { describe, it, expect } from 'vitest';
import { createInitialOXState, makeOXMove, checkOXWinner, isOXBoardFull } from './oxEngine';
import { getAIMove } from './oxAi';
import { createInitialSOSState, makeSOSMove, checkNewSOSLines } from './sosEngine';
import { getSOSAIMove } from './sosAi';

describe('OX (Tic-Tac-Toe) Engine', () => {
  it('should initialize clean empty board with X starting', () => {
    const state = createInitialOXState('X');
    expect(state.board.length).toBe(9);
    expect(state.board.every((c) => c === null)).toBe(true);
    expect(state.currentPlayer).toBe('X');
    expect(state.isGameOver).toBe(false);
  });

  it('should detect horizontal win for X on row 1', () => {
    let { state } = makeOXMove(createInitialOXState('X'), 0); // X
    state = makeOXMove(state, 3).state; // O
    state = makeOXMove(state, 1).state; // X
    state = makeOXMove(state, 4).state; // O
    state = makeOXMove(state, 2).state; // X

    expect(state.winner).toBe('X');
    expect(state.isGameOver).toBe(true);
    expect(state.winningLine?.type).toBe('horizontal');
    expect(state.winningLine?.pattern).toEqual([0, 1, 2]);
  });

  it('should detect vertical win for O on col 2', () => {
    let { state } = makeOXMove(createInitialOXState('X'), 0); // X
    state = makeOXMove(state, 1).state; // O
    state = makeOXMove(state, 3).state; // X
    state = makeOXMove(state, 4).state; // O
    state = makeOXMove(state, 8).state; // X
    state = makeOXMove(state, 7).state; // O wins at 1, 4, 7

    expect(state.winner).toBe('O');
    expect(state.isGameOver).toBe(true);
    expect(state.winningLine?.type).toBe('vertical');
    expect(state.winningLine?.pattern).toEqual([1, 4, 7]);
  });

  it('should detect diagonal-main and diagonal-anti wins', () => {
    // Main diagonal [0, 4, 8]
    const mainDiagBoard = ['X', 'O', null, null, 'X', 'O', null, null, 'X'] as any;
    expect(checkOXWinner(mainDiagBoard).winner).toBe('X');
    expect(checkOXWinner(mainDiagBoard).winningLine?.type).toBe('diagonal-main');

    // Anti diagonal [2, 4, 6]
    const antiDiagBoard = [null, 'X', 'O', 'X', 'O', null, 'O', null, null] as any;
    expect(checkOXWinner(antiDiagBoard).winner).toBe('O');
    expect(checkOXWinner(antiDiagBoard).winningLine?.type).toBe('diagonal-anti');
  });

  it('should detect draw when board is full and no winner', () => {
    // X O X
    // X O O
    // O X X
    const drawBoard = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'] as any;
    expect(checkOXWinner(drawBoard).winner).toBe(null);
    expect(isOXBoardFull(drawBoard)).toBe(true);
  });

  it('should reject invalid moves on occupied cell', () => {
    const init = createInitialOXState('X');
    const firstMove = makeOXMove(init, 4);
    expect(firstMove.valid).toBe(true);

    const secondMove = makeOXMove(firstMove.state, 4);
    expect(secondMove.valid).toBe(false);
    expect(secondMove.error).toBe('Cell already occupied');
  });

  it('Hard AI should block immediate win or win if possible', () => {
    // Human is X at 0, 1. AI is O. AI must block at 2.
    const board = ['X', 'X', null, 'O', null, null, null, null, null] as any;
    const aiMove = getAIMove(board, 'O', 'HARD');
    expect(aiMove).toBe(2);
  });
});

describe('SOS Engine', () => {
  it('should initialize 5x5 board correctly', () => {
    const state = createInitialSOSState(5, 'p1');
    expect(state.board.length).toBe(25);
    expect(state.boardSize).toBe(5);
    expect(state.scores).toEqual({ p1: 0, p2: 0 });
    expect(state.currentTurn).toBe('p1');
  });

  it('should detect horizontal SOS formation when S is placed at end', () => {
    // Place S at (0,0)=0, O at (0,1)=1, then S at (0,2)=2
    const state = createInitialSOSState(5, 'p1');
    const s1 = makeSOSMove(state, 0, 'S').state;
    expect(s1.currentTurn).toBe('p2');

    const s2 = makeSOSMove(s1, 1, 'O').state;
    expect(s2.currentTurn).toBe('p1');

    // p1 places 'S' at index 2 -> forms SOS!
    const res3 = makeSOSMove(s2, 2, 'S');
    expect(res3.formedSOSCount).toBe(1);
    expect(res3.state.scores.p1).toBe(1);
    // Player gets an extra turn!
    expect(res3.state.currentTurn).toBe('p1');
    expect(res3.state.sosLines.length).toBe(1);
  });

  it('should detect SOS formed by placing middle O', () => {
    // 5x5: index 0 (0,0)=S, index 2 (0,2)=S. Placing 'O' at index 1 (0,1)
    const board = Array(25).fill(null);
    board[0] = 'S';
    board[2] = 'S';
    const lines = checkNewSOSLines(board, 5, 1, 'O', 'p1', []);
    expect(lines.length).toBe(1);
    expect(lines[0].direction).toBe('horizontal');
  });

  it('should detect multiple SOS formations from a single move (Combo!)', () => {
    // In a 5x5 grid, put:
    // (0,1)=S, (2,1)=S (vertical through 1,1)
    // (1,0)=S, (1,2)=S (horizontal through 1,1)
    // (0,0)=S, (2,2)=S (diagonal-main through 1,1)
    // (0,2)=S, (2,0)=S (diagonal-anti through 1,1)
    // Then place 'O' at index 6 (1,1) -> Should form 4 SOS simultaneously!
    const board = Array(25).fill(null);
    const size = 5;
    board[0 * 5 + 1] = 'S'; board[2 * 5 + 1] = 'S';
    board[1 * 5 + 0] = 'S'; board[1 * 5 + 2] = 'S';
    board[0 * 5 + 0] = 'S'; board[2 * 5 + 2] = 'S';
    board[0 * 5 + 2] = 'S'; board[2 * 5 + 0] = 'S';

    const centerIdx = 1 * 5 + 1; // 6
    const lines = checkNewSOSLines(board, size, centerIdx, 'O', 'p1', []);
    expect(lines.length).toBe(4);
  });

  it('SOS AI should find available scoring move on Hard difficulty', () => {
    const board = Array(25).fill(null);
    board[0] = 'S';
    board[1] = 'O';
    // index 2 is empty -> placing 'S' at index 2 makes SOS
    const move = getSOSAIMove(board, 5, [], 'HARD');
    expect(move.index).toBe(2);
    expect(move.symbol).toBe('S');
  });
});
