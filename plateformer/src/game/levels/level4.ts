import { PLAYER_SIZE } from '../constants';
import type { World } from '../types';

/** Niveau 4 : la chambre du boss. Trois coups sur la tête, et la porte s'ouvre. */
export const level4 = (): World => ({
  width: 1200,
  player: { position: { x: 60, y: 30 }, velocity: { x: 0, y: 0 }, size: PLAYER_SIZE, onGround: false },
  enemies: [],
  platforms: [
    { position: { x: 0, y: 430 }, size: { width: 1200, height: 50 } },
    { position: { x: 180, y: 320 }, size: { width: 130, height: 20 } },
    { position: { x: 520, y: 270 }, size: { width: 160, height: 20 } },
    { position: { x: 890, y: 320 }, size: { width: 130, height: 20 } },
  ],
  coins: [
    { position: { x: 230, y: 275 }, collected: false },
    { position: { x: 590, y: 225 }, collected: false },
    { position: { x: 940, y: 275 }, collected: false },
    { position: { x: 600, y: 390 }, collected: false },
  ],
  spikes: [
    { position: { x: 350, y: 410 }, size: { width: 55, height: 20 } },
    { position: { x: 760, y: 410 }, size: { width: 55, height: 20 } },
  ],
  boss: {
    position: { x: 560, y: 374 },
    size: 56,
    direction: 1,
    speed: 1.1,
    patrol: { minX: 120, maxX: 1030 },
    hitPoints: 3,
    maxHitPoints: 3,
    invulnerableSteps: 0,
  },
  exit: { position: { x: 1140, y: 330 }, size: { width: 40, height: 100 } },
  pressedKeys: {},
});
