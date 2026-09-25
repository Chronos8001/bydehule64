import type { EngineEntities, Flamethrower, GameEvent, Position, Projectile, Zone } from './types';
import { PLAYER_SIZE, WORLD_HEIGHT } from './constants';

const GRAVITY = 0.5;
const FALL_GRAVITY = 0.25;
const MOVE_SPEED = 3;
const JUMP_SPEED = -11;

// Pas de simulation fixe : le jeu avance à la même vitesse en 60 Hz comme en 144 Hz.
const STEP_MS = 1000 / 60;
const MAX_STEPS_PER_FRAME = 5;

// Une seconde de répit après chaque coup porté au boss.
const BOSS_INVULNERABLE_STEPS = 60;

// Rythme des attaques, en pas de simulation (60 pas = 1 seconde).
const FIREBALL_SPEED = 2.6;
const FIREBALL_SIZE = 16;
const VOLLEY_SHOTS = 3;
// Intervalle entre deux salves : \u00e0 2,6 px par pas, cela laisse ~200 px entre deux boules.
const VOLLEY_INTERVAL = 78;
const BOSS_CHARGE = 110;
const BURST_COUNT = 7;
const BOSS_RECOVER = 150;
// Il reste planté une seconde après la gerbe : c'est la fenêtre pour venir le frapper.
const BOSS_RECOVER_HOLD = 60;

type Dispatch = (event: GameEvent) => void;
type GameWorld = EngineEntities['world'];

const overlaps = (first: Position, firstSize: number, second: Position, secondSize: number) =>
  first.x < second.x + secondSize && first.x + firstSize > second.x &&
  first.y < second.y + secondSize && first.y + firstSize > second.y;

const touches = (position: Position, size: number, zone: Zone) =>
  position.x < zone.position.x + zone.size.width && position.x + size > zone.position.x &&
  position.y < zone.position.y + zone.size.height && position.y + size > zone.position.y;

export const isFlameActive = (flame: Flamethrower) => flame.timer < flame.activeSteps;

const step = (world: GameWorld, jumpPressed: boolean, dispatch: Dispatch): GameWorld => {
  const player = world.player;
  const pressedKeys = world.pressedKeys;

  const velocityX = pressedKeys.arrowleft || pressedKeys.a ? -MOVE_SPEED : pressedKeys.arrowright || pressedKeys.d ? MOVE_SPEED : 0;
  const velocityY = jumpPressed && player.onGround ? JUMP_SPEED : player.velocity.y + (player.velocity.y > 0 ? FALL_GRAVITY : GRAVITY);
  let position = { x: Math.max(0, Math.min(world.width - player.size, player.position.x + velocityX)), y: player.position.y + velocityY };
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
  if (stompedEnemy) position = { ...position, y: stompedEnemy.position.y - player.size };

  let boss = world.boss;
  let stompedBoss = false;
  let projectiles = (world.projectiles ?? [])
    .map((shot) => ({ ...shot, position: { x: shot.position.x + shot.velocity.x, y: shot.position.y + shot.velocity.y } }))
    .filter((shot) => shot.position.x > -60 && shot.position.x < world.width + 60 && shot.position.y > -60 && shot.position.y < WORLD_HEIGHT + 60);

  if (boss) {
    // Il ne s'immobilise que pour la gerbe en arc : il charge sur place, tire, puis souffle.
    const rooted = boss.invulnerableSteps === 0 && (
      boss.phase === 'charge' || boss.phase === 'burst'
      || (boss.phase === 'recover' && boss.phaseTimer < BOSS_RECOVER_HOLD)
    );
    const nextX = rooted ? boss.position.x : boss.position.x + boss.direction * boss.speed;
    const reachedPatrolEdge = !rooted && (nextX <= boss.patrol.minX || nextX >= boss.patrol.maxX);
    boss = {
      ...boss,
      position: { ...boss.position, x: Math.max(boss.patrol.minX, Math.min(boss.patrol.maxX, nextX)) },
      direction: reachedPatrolEdge ? (boss.direction * -1) as -1 | 1 : boss.direction,
      invulnerableSteps: Math.max(0, boss.invulnerableSteps - 1),
    };

    // Sonné après un coup : il cesse de tirer, ce qui laisse le temps de se replacer.
    if (boss.invulnerableSteps === 0) {
      const originX = boss.position.x + boss.size / 2 - FIREBALL_SIZE / 2;
      const originY = boss.position.y + boss.size / 2 - FIREBALL_SIZE / 2;
      const fired: Projectile[] = [];
      let { phase, phaseTimer, shotsFired } = boss;
      phaseTimer += 1;

      if (phase === 'volley') {
        if (phaseTimer >= VOLLEY_INTERVAL) {
          phaseTimer = 0;
          shotsFired += 1;
          fired.push({ position: { x: originX, y: originY }, velocity: { x: -FIREBALL_SPEED, y: 0 }, size: FIREBALL_SIZE });
          fired.push({ position: { x: originX, y: originY }, velocity: { x: FIREBALL_SPEED, y: 0 }, size: FIREBALL_SIZE });
          if (shotsFired >= VOLLEY_SHOTS) {
            phase = 'charge';
            shotsFired = 0;
          }
        }
      } else if (phase === 'charge') {
        if (phaseTimer >= BOSS_CHARGE) {
          phase = 'burst';
          phaseTimer = 0;
        }
      } else if (phase === 'burst') {
        // Gerbe en demi-cercle : deux boules rasantes, les autres en cloche au-dessus.
        for (let i = 0; i < BURST_COUNT; i += 1) {
          const angle = Math.PI * (i / (BURST_COUNT - 1));
          fired.push({
            position: { x: originX, y: originY },
            velocity: { x: Math.cos(angle) * FIREBALL_SPEED, y: -Math.sin(angle) * FIREBALL_SPEED },
            size: FIREBALL_SIZE,
          });
        }
        phase = 'recover';
        phaseTimer = 0;
      } else if (phaseTimer >= BOSS_RECOVER) {
        phase = 'volley';
        phaseTimer = 0;
      }

      boss = { ...boss, phase, phaseTimer, shotsFired };
      projectiles = [...projectiles, ...fired];
    }

    const landedOnHead = velocityY > 0 && boss.invulnerableSteps === 0
      && player.position.y + player.size <= boss.position.y + 10 && position.y + player.size >= boss.position.y
      && position.x + player.size > boss.position.x && position.x < boss.position.x + boss.size;

    if (landedOnHead) {
      position = { ...position, y: boss.position.y - player.size };
      boss = { ...boss, hitPoints: boss.hitPoints - 1, invulnerableSteps: BOSS_INVULNERABLE_STEPS };
      stompedBoss = true;
    }
    if (boss.hitPoints <= 0) {
      boss = undefined;
      // Sa mort dissipe les boules encore en vol : pas de mort volée après la victoire.
      projectiles = [];
    }
  }

  const bouncedOnEnemy = stompedEnemy !== undefined || stompedBoss;
  const hitBoss = boss !== undefined && boss.invulnerableSteps === 0 && overlaps(position, player.size, boss.position, boss.size);
  const hitProjectile = projectiles.some((shot) => overlaps(position, player.size, shot.position, shot.size));

  const hitEnemy = remainingEnemies.some((enemy) => overlaps(position, player.size, enemy.position, enemy.size));
  const coins = world.coins.map((coin) => ({ ...coin, collected: coin.collected || overlaps(position, player.size, coin.position, 18) }));

  const pickedUp = coins.filter((coin, index) => coin.collected && !world.coins[index]!.collected).length;
  for (let i = 0; i < pickedUp; i += 1) dispatch({ type: 'coin' });

  const hitSpike = world.spikes.some((spike) => touches(position, player.size, spike));

  const flamethrowers = world.flamethrowers?.map((flame) => ({
    ...flame,
    timer: (flame.timer + 1) % (flame.activeSteps + flame.idleSteps),
  }));
  const hitFlame = flamethrowers?.some((flame) => isFlameActive(flame) && touches(position, player.size, flame)) ?? false;

  if (!boss && touches(position, player.size, world.exit)) dispatch({ type: 'win' });
  if (hitEnemy || hitBoss || hitProjectile || hitSpike || hitFlame || position.y > WORLD_HEIGHT) dispatch({ type: 'lose' });

  return {
    ...world,
    player: {
      ...player,
      position,
      velocity: { x: velocityX, y: bouncedOnEnemy ? JUMP_SPEED * 0.65 : onGround ? 0 : velocityY },
      onGround: bouncedOnEnemy ? false : onGround,
    },
    enemies: remainingEnemies,
    coins,
    boss,
    projectiles,
    flamethrowers,
  };
};

export const gameSystems = [
  (
    entities: EngineEntities,
    { input, time, dispatch }: {
      input: readonly { name: string; payload?: { key?: string } }[];
      time: { delta: number };
      dispatch: Dispatch;
    },
  ) => {
    const world = entities.world;
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

    // Une frame trop longue (onglet en arrière-plan) ne doit pas téléporter le joueur.
    let remaining = Math.min((world.accumulator ?? 0) + time.delta, STEP_MS * MAX_STEPS_PER_FRAME);
    let next: GameWorld = { ...world, pressedKeys };
    let jumpPending = world.jumpPending || jumpPressed;

    while (remaining >= STEP_MS) {
      next = step(next, jumpPending, dispatch);
      jumpPending = false;
      remaining -= STEP_MS;
    }

    return { ...entities, world: { ...next, accumulator: remaining, jumpPending } };
  },
] as const;

export { PLAYER_SIZE };
