import skel from '../../skel.png';
import protagonist from '../../protagoniste.png';
import type { World } from './types';

export const WORLD_WIDTH = 900;
export const WORLD_HEIGHT = 480;
export const PLAYER_SIZE = 34;

export const initialWorld = (): World => ({
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
  pressedKeys: {},
});

export const WorldSprite = (world: World) => (
  <div className="platformer-world" aria-hidden="true">
    <div className="dungeon-backdrop">
      <div className="dungeon-moon" />
      <div className="dungeon-arch arch-left" />
      <div className="dungeon-arch arch-center" />
      <div className="dungeon-arch arch-right" />
      <div className="dungeon-banner">Dungeon of Byd'Hule : the Underdark</div>
      <div className="dungeon-pillar pillar-left" />
      <div className="dungeon-pillar pillar-right" />
    </div>
    {world.platforms.map((platform, index) => (
      <div
        className={`platformer-platform dungeon-platform platform-${index}`}
        key={`${platform.position.x}-${platform.position.y}`}
        style={{ left: `${(platform.position.x / WORLD_WIDTH) * 100}%`, top: `${(platform.position.y / WORLD_HEIGHT) * 100}%`, width: `${(platform.size.width / WORLD_WIDTH) * 100}%`, height: `${(platform.size.height / WORLD_HEIGHT) * 100}%` }}
      >
        <span />
      </div>
    ))}
    {world.coins.filter((coin) => !coin.collected).map((coin) => (
      <div className="dungeon-coin" key={`${coin.position.x}-${coin.position.y}`} style={{ left: `${(coin.position.x / WORLD_WIDTH) * 100}%`, top: `${(coin.position.y / WORLD_HEIGHT) * 100}%` }}><span>$</span></div>
    ))}
    {world.enemies.map((enemy) => (
      <div className="dungeon-skeleton" key={`${enemy.position.x}-${enemy.position.y}`} style={{ left: `${(enemy.position.x / WORLD_WIDTH) * 100}%`, top: `${(enemy.position.y / WORLD_HEIGHT) * 100}%`, width: `${(enemy.size / WORLD_WIDTH) * 100}%`, height: `${(enemy.size / WORLD_HEIGHT) * 100}%` }}><img className="dungeon-enemy-image" src={skel} alt="" /></div>
    ))}
    <div className="dungeon-hero" style={{ left: `${(world.player.position.x / WORLD_WIDTH) * 100}%`, top: `${(world.player.position.y / WORLD_HEIGHT) * 100}%`, width: `${(world.player.size / WORLD_WIDTH) * 100}%`, height: `${(world.player.size / WORLD_HEIGHT) * 100}%` }}><img className="dungeon-hero-image" src={protagonist} alt="" /></div>
    <div className="dungeon-vignette" />
  </div>
);
