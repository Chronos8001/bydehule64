import skel from '../../skel.png';
import protagonist from '../../protagoniste.png';
import { WORLD_HEIGHT, WORLD_WIDTH } from './constants';
import { isFlameActive } from './systems';
import type { World } from './types';

// Dernier demi-seconde avant l'allumage : la buse crache des étincelles.
const WARNING_STEPS = 30;

export const WorldSprite = (world: World) => {
  const camera = Math.max(
    0,
    Math.min(world.width - WORLD_WIDTH, world.player.position.x + world.player.size / 2 - WORLD_WIDTH / 2),
  );
  const percentX = (value: number) => `${(value / world.width) * 100}%`;
  const percentY = (value: number) => `${(value / WORLD_HEIGHT) * 100}%`;

  return (
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

      <div
        className="platformer-scroll"
        style={{ width: `${(world.width / WORLD_WIDTH) * 100}%`, transform: `translateX(-${(camera / world.width) * 100}%)` }}
      >
        {world.platforms.map((platform, index) => (
          <div
            className={`platformer-platform dungeon-platform platform-${index}`}
            key={`${platform.position.x}-${platform.position.y}`}
            style={{ left: percentX(platform.position.x), top: percentY(platform.position.y), width: percentX(platform.size.width), height: percentY(platform.size.height) }}
          >
            <span />
          </div>
        ))}
        {world.spikes.map((spike) => (
          <div
            className="dungeon-spike"
            key={`${spike.position.x}-${spike.position.y}`}
            style={{ left: percentX(spike.position.x), top: percentY(spike.position.y), width: percentX(spike.size.width), height: percentY(spike.size.height) }}
          />
        ))}
        {(world.flamethrowers ?? []).map((flame) => {
          const active = isFlameActive(flame);
          const warming = !active && flame.timer >= flame.activeSteps + flame.idleSteps - WARNING_STEPS;
          return (
            <div
              className={`dungeon-flame flame-${flame.direction}`}
              data-active={active}
              data-warming={warming}
              key={`${flame.position.x}-${flame.position.y}`}
              style={{ left: percentX(flame.position.x), top: percentY(flame.position.y), width: percentX(flame.size.width), height: percentY(flame.size.height) }}
            >
              <span className="flame-jet" />
              <span className="flame-nozzle" />
            </div>
          );
        })}
        <div
          className="dungeon-exit"
          data-locked={world.boss !== undefined}
          style={{ left: percentX(world.exit.position.x), top: percentY(world.exit.position.y), width: percentX(world.exit.size.width), height: percentY(world.exit.size.height) }}
        >
          <span />
        </div>
        {world.coins.filter((coin) => !coin.collected).map((coin) => (
          <div className="dungeon-coin" key={`${coin.position.x}-${coin.position.y}`} style={{ left: percentX(coin.position.x), top: percentY(coin.position.y), width: percentX(22) }}><span>$</span></div>
        ))}
        {world.enemies.map((enemy) => (
          <div className="dungeon-skeleton" key={`${enemy.patrol.minX}-${enemy.position.y}`} style={{ left: percentX(enemy.position.x), top: percentY(enemy.position.y), width: percentX(enemy.size), height: percentY(enemy.size) }}><img className="dungeon-enemy-image" src={skel} alt="" /></div>
        ))}
        {world.boss && (
          <div
            className="dungeon-boss"
            data-hurt={world.boss.invulnerableSteps > 0}
            style={{ left: percentX(world.boss.position.x), top: percentY(world.boss.position.y), width: percentX(world.boss.size), height: percentY(world.boss.size) }}
          >
            <div className="boss-health"><span style={{ width: `${(world.boss.hitPoints / world.boss.maxHitPoints) * 100}%` }} /></div>
            <img className="dungeon-enemy-image" src={skel} alt="" />
          </div>
        )}
        <div className="dungeon-hero" style={{ left: percentX(world.player.position.x), top: percentY(world.player.position.y), width: percentX(world.player.size), height: percentY(world.player.size) }}><img className="dungeon-hero-image" src={protagonist} alt="" /></div>
      </div>

      <div className="dungeon-vignette" />
    </div>
  );
};
