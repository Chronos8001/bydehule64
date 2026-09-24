import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { ScoreEntry } from './types.js';

// node:sqlite est intégré à Node (>= 22.5) : pas de compilation native,
// donc pas besoin de Visual Studio Build Tools sous Windows.
const DB_FILE = resolve(process.env.DATABASE_FILE ?? './data/scores.db');
mkdirSync(dirname(DB_FILE), { recursive: true });

export const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id          TEXT PRIMARY KEY,
    player      TEXT    NOT NULL,
    game        TEXT    NOT NULL,
    score       INTEGER NOT NULL,
    coins       INTEGER NOT NULL DEFAULT 0,
    levels      INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL,
    created_at  TEXT    NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_scores_game  ON scores (game, score DESC, duration_ms ASC);
  CREATE INDEX IF NOT EXISTS idx_scores_player ON scores (player);
`);

// Migration des bases créées avant l'ajout des pièces et des niveaux.
const columns = db.prepare('PRAGMA table_info(scores)').all() as unknown as { name: string }[];
for (const column of ['coins', 'levels']) {
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE scores ADD COLUMN ${column} INTEGER NOT NULL DEFAULT 0`);
  }
}

/** Forme brute d'une ligne SQL (colonnes en snake_case). */
export interface ScoreRow {
  id: string;
  player: string;
  game: string;
  score: number;
  coins: number;
  levels: number;
  duration_ms: number;
  created_at: string;
}

/** Convertit une ligne SQL en objet exposé par l'API. */
export function toScoreEntry(row: ScoreRow): ScoreEntry {
  return {
    id: row.id,
    player: row.player,
    game: row.game,
    score: row.score,
    coins: row.coins,
    levels: row.levels,
    durationMs: row.duration_ms,
    createdAt: row.created_at,
  };
}