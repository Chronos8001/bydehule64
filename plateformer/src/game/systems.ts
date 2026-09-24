import type { EngineEntities, GameEvent, Position } from './types';
import { PLAYER_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from './level1';

const GRAVITY = 0.5;
const FALL_GRAVITY = 0.25;
const MOVE_SPEED = 3;
const JUMP_SPEED = -11;

const overlaps = (first: Position, firstSize: number, second: Position, secondSize: number) =>
  first.x < second.x + secondSize && first.x + firstSize > second.x &&
  first.y < second.y + secondSize && first.y + firstSize > second.y;

export const gameSystems = [
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

    return {
      ...entities,
      world: {
        ...world,
        player: {
          ...player,
          position,
          velocity: { x: velocityX, y: bouncedOnEnemy ? JUMP_SPEED * 0.65 : onGround ? 0 : velocityY },
          onGround: bouncedOnEnemy ? false : onGround,
        },
        enemies: remainingEnemies,
        coins,
        pressedKeys,
      },
    };
  },
] as const;

export { PLAYER_SIZE };
