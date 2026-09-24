import type { ReactElement } from 'react';

export type GameStatus = 'intro' | 'playing' | 'won' | 'lost';

export interface Position {
  x: number;
  y: number;
}

export interface Platform {
  position: Position;
  size: { width: number; height: number };
}

export interface Player {
  position: Position;
  velocity: Position;
  size: number;
  onGround: boolean;
}

export interface Enemy {
  position: Position;
  size: number;
  direction: -1 | 1;
  speed: number;
  patrol: { minX: number; maxX: number };
}

export interface Collectible {
  position: Position;
  collected: boolean;
}

export interface World {
  player: Player;
  enemies: Enemy[];
  platforms: Platform[];
  coins: Collectible[];
  pressedKeys: Record<string, boolean>;
}

export interface GameEvent {
  type: 'win' | 'lose';
}

export type WorldRenderer = (world: World) => ReactElement;

export interface EngineEntities {
  world: World & { renderer: WorldRenderer };
}
