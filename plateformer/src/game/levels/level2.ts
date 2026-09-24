import { PLAYER_SIZE } from '../constants';
import type { World } from '../types';

/** Niveau 2 : deux fois plus long, cinq squelettes et des pics au sol. */
export const level2 = (): World => ({
  width: 1800,
  player: { position: { x: 40, y: 30 }, velocity: { x: 0, y: 0 }, size: PLAYER_SIZE, onGround: false },
  enemies: [
    { position: { x: 60, y: 402 }, size: 28, direction: 1, speed: 0.4, patrol: { minX: 20, maxX: 185 } },
    { position: { x: 690, y: 402 }, size: 28, direction: -1, speed: 0.45, patrol: { minX: 665, maxX: 780 } },
    { position: { x: 980, y: 402 }, size: 28, direction: 1, speed: 0.55, patrol: { minX: 960, maxX: 1120 } },
    { position: { x: 720, y: 222 }, size: 28, direction: 1, speed: 0.4, patrol: { minX: 705, maxX: 790 } },
    { position: { x: 1140, y: 252 }, size: 28, direction: -1, speed: 0.5, patrol: { minX: 1125, maxX: 1220 } },
  ],
  platforms: [
    { position: { x: 0, y: 430 }, size: { width: 220, height: 50 } },
    { position: { x: 350, y: 430 }, size: { width: 180, height: 50 } },
    { position: { x: 660, y: 430 }, size: { width: 150, height: 50 } },
    { position: { x: 950, y: 430 }, size: { width: 200, height: 50 } },
    { position: { x: 1290, y: 430 }, size: { width: 160, height: 50 } },
    { position: { x: 1590, y: 430 }, size: { width: 210, height: 50 } },
    { position: { x: 180, y: 340 }, size: { width: 120, height: 20 } },
    { position: { x: 430, y: 300 }, size: { width: 140, height: 20 } },
    { position: { x: 700, y: 250 }, size: { width: 120, height: 20 } },
    { position: { x: 900, y: 330 }, size: { width: 100, height: 20 } },
    { position: { x: 1120, y: 280 }, size: { width: 130, height: 20 } },
    { position: { x: 1380, y: 230 }, size: { width: 120, height: 20 } },
    { position: { x: 1600, y: 300 }, size: { width: 130, height: 20 } },
  ],
  coins: [
    { position: { x: 215, y: 300 }, collected: false },
    { position: { x: 470, y: 260 }, collected: false },
    { position: { x: 740, y: 210 }, collected: false },
    { position: { x: 930, y: 290 }, collected: false },
    { position: { x: 1160, y: 240 }, collected: false },
    { position: { x: 1420, y: 190 }, collected: false },
    { position: { x: 1640, y: 260 }, collected: false },
    { position: { x: 1050, y: 392 }, collected: false },
  ],
  spikes: [
    { position: { x: 420, y: 410 }, size: { width: 55, height: 20 } },
    { position: { x: 1330, y: 410 }, size: { width: 60, height: 20 } },
    { position: { x: 1680, y: 410 }, size: { width: 55, height: 20 } },
  ],
  exit: { position: { x: 1745, y: 330 }, size: { width: 40, height: 100 } },
  pressedKeys: {},
});
