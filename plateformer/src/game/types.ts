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

/** Zone rectangulaire : pics mortels ou porte de sortie. */
export interface Zone {
  position: Position;
  size: { width: number; height: number };
}

export interface World {
  /** Largeur du niveau en unités monde ; au-delà de la vue, la caméra suit le joueur. */
  width: number;
  player: Player;
  enemies: Enemy[];
  platforms: Platform[];
  coins: Collectible[];
  spikes: Zone[];
  exit: Zone;
  pressedKeys: Record<string, boolean>;
  /** Temps non encore simulé, reporté d'une frame à l'autre par le pas fixe. */
  accumulator?: number;
  /** Appui sur saut reçu entre deux pas : il attend le prochain pas pour s'appliquer. */
  jumpPending?: boolean;
}

export interface GameEvent {
  type: 'win' | 'lose' | 'coin';
}

export type WorldRenderer = (world: World) => ReactElement;

export interface EngineEntities {
  world: World & { renderer: WorldRenderer };
}
