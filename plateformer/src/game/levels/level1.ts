import { PLAYER_SIZE } from '../constants';
import type { World } from '../types';

/** Niveau 1 : introduction, un seul écran, deux squelettes. */
export const level1 = (): World => ({
  width: 900,
  player: { position: { x: 80, y: 30 }, velocity: { x: 0, y: 0 }, size: PLAYER_SIZE, onGround: false },
  enemies: [
    { position: { x: 490, y: 402 }, size: 28, direction: 1, speed: 0.4, patrol: { minX: 440, maxX: 570 } },
    { position: { x: 420, y: 262 }, size: 28, direction: -1, speed: 0.3, patrol: { minX: 395, maxX: 490 } },
  ],
  platforms: [
    { position: { x: 0, y: 430 }, size: { width: 260, height: 50 } },
    { position: { x: 360, y: 430 }, size: { width: 240, height: 50 } },
    { position: { x: 700, y: 430 }, size: { width: 200, height: 50 } },
    { position: { x: 155, y: 345 }, size: { width: 145, height: 20 } },
    { position: { x: 390, y: 290 }, size: { width: 135, height: 20 } },
    { position: { x: 625, y: 230 }, size: { width: 150, height: 20 } },
  ],
  coins: [
    { position: { x: 215, y: 305 }, collected: false },
    { position: { x: 455, y: 250 }, collected: false },
    { position: { x: 695, y: 190 }, collected: false },
  ],
  spikes: [],
  exit: { position: { x: 845, y: 330 }, size: { width: 40, height: 100 } },
  pressedKeys: {},
});
