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

/** Piège périodique : un jet de flammes qui s'allume et s'éteint en boucle. */
export interface Flamethrower {
  position: Position;
  size: { width: number; height: number };
  /** Sens du jet, pour placer la buse au bon bout de la zone. */
  direction: 'up' | 'down';
  /** Durées du cycle, en pas de simulation (60 pas = 1 seconde). */
  activeSteps: number;
  idleSteps: number;
  /** Position courante dans le cycle ; décaler les valeurs désynchronise plusieurs pièges. */
  timer: number;
}

/** Boule de feu crachée par le boss : trajectoire rectiligne, mortelle au contact. */
export interface Projectile {
  position: Position;
  velocity: Position;
  size: number;
}

/** Cycle d'attaque : trois salves latérales en marchant, puis il se fige pour la gerbe en arc. */
export type BossPhase = 'volley' | 'charge' | 'burst' | 'recover';

/** Ennemi de fin de niveau : plusieurs coups à encaisser, et il verrouille la sortie. */
export interface Boss {
  position: Position;
  size: number;
  direction: -1 | 1;
  speed: number;
  patrol: { minX: number; maxX: number };
  hitPoints: number;
  maxHitPoints: number;
  /** Pas de simulation restants pendant lesquels le boss ne peut ni blesser ni être blessé. */
  invulnerableSteps: number;
  phase: BossPhase;
  /** Pas écoulés depuis le début de la phase courante. */
  phaseTimer: number;
  /** Salves déjà tirées dans la phase `volley`. */
  shotsFired: number;
}

export interface World {
  /** Largeur du niveau en unités monde ; au-delà de la vue, la caméra suit le joueur. */
  width: number;
  player: Player;
  enemies: Enemy[];
  platforms: Platform[];
  coins: Collectible[];
  spikes: Zone[];
  /** Pièges à flammes, absents des niveaux qui n'en utilisent pas. */
  flamethrowers?: Flamethrower[];
  exit: Zone;
  /** Présent uniquement dans une chambre de boss : la sortie reste fermée tant qu'il vit. */
  boss?: Boss;
  /** Boules de feu en vol. */
  projectiles?: Projectile[];
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
