import type { ScoreEntry } from '../types/api';

export interface GameState {
  playerName: string;
  lastScore: ScoreEntry | null;
}

export type GameAction =
  | { type: 'setPlayerName'; playerName: string }
  | { type: 'scoreSaved'; score: ScoreEntry }
  | { type: 'resetScore' };

export const initialState: GameState = { playerName: '', lastScore: null };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'setPlayerName':
      return { ...state, playerName: action.playerName };
    case 'scoreSaved':
      return { ...state, lastScore: action.score, playerName: action.score.player };
    case 'resetScore':
      return { ...state, lastScore: null };
    default:
      return state;
  }
}