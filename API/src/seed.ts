import { randomUUID } from 'node:crypto';
import { db } from './db.js';

const GAMES = ['snake', 'memory', 'reaction'];
const PLAYERS = ['Nathan', 'Lina', 'Youssef', 'Marion', 'Theo', 'Sofia', 'Elias', 'Chloe'];

const insert = db.prepare(
  `INSERT INTO scores (id, player, game, score, duration_ms, created_at)
   VALUES (?, ?, ?, ?, ?, ?)`,
);

function seed(): void {
  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM scores').run();
    for (let i = 0; i < 120; i += 1) {
      const player = PLAYERS[i % PLAYERS.length]!;
      const game = GAMES[i % GAMES.length]!;
      const score = Math.floor(Math.random() * 900) + 50;
      const durationMs = Math.floor(Math.random() * 180_000) + 15_000;
      const createdAt = new Date(Date.now() - i * 3_600_000).toISOString();
      insert.run(randomUUID(), player, game, score, durationMs, createdAt);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

seed();
console.log('120 parties de démonstration insérées.');