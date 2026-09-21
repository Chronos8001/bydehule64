import { useCallback, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameEngine } from 'react-game-engine';
import { Button } from '../components/ui/Button';
import './GamePage.css';

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 480;
const PLAYER_SIZE = 34;
const GRAVITY = 0.7;
const MOVE_SPEED = 5;
const JUMP_SPEED = -13;

type GameStatus = 'playing' | 'won' | 'lost';

interface Position { x: number; y: number; }
interface Platform { position: Position; size: { width: number; height: number }; }
interface Player { position: Position; velocity: Position; size: number; onGround: boolean; }
interface Collectible { position: Position; collected: boolean; }
interface World { player: Player; platforms: Platform[]; coins: Collectible[]; pressedKeys: Record<string, boolean>; }
interface GameEvent { type: 'win' | 'lose'; }
interface EngineEntities { world: World & { renderer: typeof WorldSprite }; }

const initialWorld = (): World => ({
  player: { position: { x: 80, y: 365 }, velocity: { x: 0, y: 0 }, size: PLAYER_SIZE, onGround: false },
  platforms: [
    { position: { x: 0, y: 430 }, size: { width: WORLD_WIDTH, height: 50 } },
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

const WorldSprite = ({ player, platforms, coins }: World) => (
  <div className="platformer-world">
    {platforms.map((platform, index) => <div className="platformer-platform" key={index} style={{ left: platform.position.x, top: platform.position.y, width: platform.size.width, height: platform.size.height }} />)}
    {coins.map((coin, index) => !coin.collected && <div className="platformer-coin" key={index} style={{ left: coin.position.x, top: coin.position.y }} />)}
    <div className="platformer-player" style={{ left: player.position.x, top: player.position.y, width: player.size, height: player.size }} />
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
    const velocityY = jumpPressed && player.onGround ? JUMP_SPEED : player.velocity.y + GRAVITY;
    let position = { x: Math.max(0, Math.min(WORLD_WIDTH - player.size, player.position.x + velocityX)), y: player.position.y + velocityY };
    let onGround = false;

    world.platforms.forEach((platform) => {
      const landedOnPlatform = velocityY >= 0 && player.position.y + player.size <= platform.position.y + 8 && position.y + player.size >= platform.position.y && position.x + player.size > platform.position.x && position.x < platform.position.x + platform.size.width;
      if (landedOnPlatform) {
        position = { ...position, y: platform.position.y - player.size };
        onGround = true;
      }
    });

    const coins = world.coins.map((coin) => ({ ...coin, collected: coin.collected || overlaps(position, player.size, coin.position, 18) }));
    if (coins.every((coin) => coin.collected)) dispatch({ type: 'win' });
    if (position.y > WORLD_HEIGHT) dispatch({ type: 'lose' });

    return { ...entities, world: { ...world, player: { ...player, position, velocity: { x: velocityX, y: onGround ? 0 : velocityY }, onGround }, coins, pressedKeys } };
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