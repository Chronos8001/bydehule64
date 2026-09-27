import { createContext, useContext, type Dispatch } from 'react';
import type { GameAction, GameState } from './gameReducer';

export interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function useGameContext(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGameContext doit être utilisé dans GameProvider.');
  return context;
}