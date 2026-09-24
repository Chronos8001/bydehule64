import { useCallback, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameEngine } from 'react-game-engine';
import { Button } from '../components/ui/Button';
import sansUndertale from '../../Sansundertale.webp';
import './GamePage.css';

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 480;
const PLAYER_SIZE = 34;
const GRAVITY = 0.5;
const FALL_GRAVITY = 0.25;
const MOVE_SPEED = 3;
const JUMP_SPEED = -11;

type GameStatus = 'playing' | 'won' | 'lost';

interface Position { x: number; y: number; }
interface Platform { position: Position; size: { width: number; height: number }; }
interface Player { position: Position; velocity: Position; size: number; onGround: boolean; }
interface Enemy { position: Position; size: number; direction: -1 | 1; speed: number; patrol: { minX: number; maxX: number }; }
interface Collectible { position: Position; collected: boolean; }
interface World { player: Player; enemies: Enemy[]; platforms: Platform[]; coins: Collectible[]; pressedKeys: Record<string, boolean>; }
interface GameEvent { type: 'win' | 'lose'; }
interface EngineEntities { world: World & { renderer: typeof WorldSprite }; }

const initialWorld = (): World => ({
  player: { position: { x: 80, y: 365 }, velocity: { x: 0, y: 0 }, size: PLAYER_SIZE, onGround: false },
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

const overlaps = (first: Position, firstSize: number, second: Position, secondSize: number) =>
  first.x < second.x + secondSize && first.x + firstSize > second.x &&
  first.y < second.y + secondSize && first.y + firstSize > second.y;

const WorldSprite = (world: World) => (
  <div className="platformer-world" aria-hidden="true">
    <div className="dungeon-backdrop">
      <div className="dungeon-moon" />
      <div className="dungeon-arch arch-left" />
      <div className="dungeon-arch arch-center" />
      <div className="dungeon-arch arch-right" />
      <div className="dungeon-banner">CRYPT OF THE CINDER CROWN</div>
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
      <div className="dungeon-skeleton" key={`${enemy.position.x}-${enemy.position.y}`} style={{ left: `${(enemy.position.x / WORLD_WIDTH) * 100}%`, top: `${(enemy.position.y / WORLD_HEIGHT) * 100}%`, width: `${(enemy.size / WORLD_WIDTH) * 100}%`, height: `${(enemy.size / WORLD_HEIGHT) * 100}%` }}><img className="dungeon-enemy-image" src={sansUndertale} alt="" /></div>
    ))}
    <div className="dungeon-hero" style={{ left: `${(world.player.position.x / WORLD_WIDTH) * 100}%`, top: `${(world.player.position.y / WORLD_HEIGHT) * 100}%`, width: `${(world.player.size / WORLD_WIDTH) * 100}%`, height: `${(world.player.size / WORLD_HEIGHT) * 100}%` }}><b /><i /><span /></div>
    <div className="dungeon-vignette" />
  </div>
);

const gameSystems = [
  (entities: EngineEntities, { input, dispatch }: { input: readonly { name: string; payload?: { key?: string } }[]; dispatch: (event: GameEvent) => void }) => {
    const world = entities.world;
    const player = world.player;
    const pressedKeys = { ...world.pressedKeys };
    let jumpPressed = false;
    input.forEach((event) => {
      const key = event.payload?.key?.toLowerCase();
      if (!key) return;
      if (event.name === 'onKeyDown') {
        jumpPressed ||= !pressedKeys[key] && (key === 'arrowup' || key === 'w' || key === ' ');
        pressedKeys[key] = true;
      }
      if (event.name === 'onKeyUp') pressedKeys[key] = false;
    });
    const velocityX = pressedKeys.arrowleft || pressedKeys.a ? -MOVE_SPEED : pressedKeys.arrowright || pressedKeys.d ? MOVE_SPEED : 0;
    const velocityY = jumpPressed && player.onGround ? JUMP_SPEED : player.velocity.y + (player.velocity.y > 0 ? FALL_GRAVITY : GRAVITY);
    let position = { x: Math.max(0, Math.min(WORLD_WIDTH - player.size, player.position.x + velocityX)), y: player.position.y + velocityY };
    let onGround = false;

    world.platforms.forEach((platform) => {
      const landedOnPlatform = velocityY >= 0 && player.position.y + player.size <= platform.position.y + 8 && position.y + player.size >= platform.position.y && position.x + player.size > platform.position.x && position.x < platform.position.x + platform.size.width;
      if (landedOnPlatform) {
        position = { ...position, y: platform.position.y - player.size };
        onGround = true;
      }
    });

    const enemies = world.enemies.map((enemy) => {
      const nextX = enemy.position.x + enemy.direction * enemy.speed;
      const reachedPatrolEdge = nextX <= enemy.patrol.minX || nextX >= enemy.patrol.maxX;
      const direction = reachedPatrolEdge ? (enemy.direction * -1) as -1 | 1 : enemy.direction;
      return { ...enemy, position: { ...enemy.position, x: Math.max(enemy.patrol.minX, Math.min(enemy.patrol.maxX, nextX)) }, direction };
    });
    const stompedEnemy = velocityY > 0
      ? enemies.find((enemy) => player.position.y + player.size <= enemy.position.y + 6 && position.y + player.size >= enemy.position.y && position.x + player.size > enemy.position.x && position.x < enemy.position.x + enemy.size)
      : undefined;
    const remainingEnemies = stompedEnemy ? enemies.filter((enemy) => enemy !== stompedEnemy) : enemies;
    const bouncedOnEnemy = stompedEnemy !== undefined;
    if (stompedEnemy) position = { ...position, y: stompedEnemy.position.y - player.size };
    const hitEnemy = remainingEnemies.some((enemy) => overlaps(position, player.size, enemy.position, enemy.size));
    const coins = world.coins.map((coin) => ({ ...coin, collected: coin.collected || overlaps(position, player.size, coin.position, 18) }));
    if (coins.every((coin) => coin.collected)) dispatch({ type: 'win' });
    if (hitEnemy || position.y > WORLD_HEIGHT) dispatch({ type: 'lose' });

    return { ...entities, world: { ...world, player: { ...player, position, velocity: { x: velocityX, y: bouncedOnEnemy ? JUMP_SPEED * 0.65 : onGround ? 0 : velocityY }, onGround: bouncedOnEnemy ? false : onGround }, enemies: remainingEnemies, coins, pressedKeys } };
  },
];

export const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<GameStatus>('playing');
  const [runId, setRunId] = useState(0);
  const restart = useCallback(() => { setStatus('playing'); setRunId((run) => run + 1); }, []);
  const handleEvent = useCallback((event: GameEvent) => {
    if (event.type === 'win') setStatus('won');
    if (event.type === 'lose') setStatus('lost');
  }, []);
  const focusEngine = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.querySelector<HTMLElement>('.platformer-engine')?.focus();
  };

  return (
    <section className="platformer-shell">
      <div className="platformer-stage" onClick={focusEngine} aria-label="Platformer game. Use arrow keys or A and D to move, and Up or W to jump.">
        <GameEngine className="platformer-engine" key={runId} systems={gameSystems} entities={{ world: { ...initialWorld(), renderer: WorldSprite } }} onEvent={handleEvent} running={status === 'playing'} />
        {status !== 'playing' && <div className="platformer-overlay"><p>{status === 'won' ? 'LEVEL CLEAR' : 'TRY AGAIN'}</p><Button onClick={restart}>{status === 'won' ? 'NEXT LEVEL' : 'RESTART'}</Button></div>}
      </div>
      <Button variant="danger" onClick={() => navigate('/')}>BACK TO MENU</Button>
    </section>
  );
};