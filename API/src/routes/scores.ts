import { Router, type Request, type Response, type NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { db, toScoreEntry, type ScoreRow } from '../db.js';
import { HttpError } from '../lib/http-error.js';
import { writeRateLimit } from '../middleware/rate-limit.js';
import { createScoreSchema, listScoresQuerySchema } from '../schemas.js';
import type { Paginated, ScoreEntry, SortKey, SortOrder } from '../types.js';

export const scoresRouter = Router();

/** Clauses ORDER BY autorisées : jamais de tri construit depuis la query brute. */
const ORDER_BY: Record<SortKey, Record<SortOrder, string>> = {
  score: {
    desc: 'score DESC, duration_ms ASC, created_at ASC',
    asc: 'score ASC, duration_ms DESC, created_at ASC',
  },
  time: {
    asc: 'duration_ms ASC, score DESC, created_at ASC',
    desc: 'duration_ms DESC, score ASC, created_at ASC',
  },
  date: {
    desc: 'created_at DESC',
    asc: 'created_at ASC',
  },
};

const DEFAULT_ORDER: Record<SortKey, SortOrder> = { score: 'desc', time: 'asc', date: 'desc' };

/** GET /api/scores — liste filtrée, triée et paginée. */
scoresRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listScoresQuerySchema.parse(req.query);
    const order: SortOrder = query.order ?? DEFAULT_ORDER[query.sort];

    const where: string[] = [];
    const params: Record<string, string> = {};
    if (query.game) {
      where.push('game = :game');
      params['game'] = query.game;
    }
    if (query.player) {
      where.push('player = :player');
      params['player'] = query.player;
    }
    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const { total } = db
      .prepare(`SELECT COUNT(*) AS total FROM scores ${whereSql}`)
      .get(params) as unknown as { total: number };

    const rows = db
      .prepare(
        `SELECT * FROM scores ${whereSql}
         ORDER BY ${ORDER_BY[query.sort][order]}
         LIMIT :limit OFFSET :offset`,
      )
      .all({ ...params, limit: query.limit, offset: query.offset }) as unknown as ScoreRow[];

    const body: Paginated<ScoreEntry> = {
      data: rows.map(toScoreEntry),
      meta: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + rows.length < total,
      },
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
});

/** GET /api/scores/:id — détail d'une partie (route à paramètre côté React). */
scoresRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (!id) throw HttpError.validation("Identifiant manquant dans l'URL.");
    const row = db.prepare('SELECT * FROM scores WHERE id = ?').get(id) as unknown as
      | ScoreRow
      | undefined;
    if (!row) throw HttpError.notFound(`Aucune partie avec l'identifiant ${id}.`);
    res.json(toScoreEntry(row));
  } catch (err) {
    next(err);
  }
});

/** POST /api/scores — enregistre une partie terminée. */
scoresRouter.post('/', writeRateLimit, (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createScoreSchema.parse(req.body);
    const entry: ScoreEntry = {
      id: randomUUID(),
      player: input.player,
      game: input.game,
      score: input.score,
      durationMs: input.durationMs,
      createdAt: new Date().toISOString(),
    };

    db.prepare(
      `INSERT INTO scores (id, player, game, score, duration_ms, created_at)
       VALUES (@id, @player, @game, @score, @durationMs, @createdAt)`,
    ).run(entry as unknown as Record<string, string | number>);

    res.status(201).location(`/api/scores/${entry.id}`).json(entry);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/scores/:id — protégé par un jeton, pratique pour nettoyer la démo. */
scoresRouter.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const expected = process.env.ADMIN_TOKEN;
    if (!expected || req.get('x-admin-token') !== expected) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Jeton administrateur manquant ou invalide.');
    }
    const id = req.params.id;
    if (!id) throw HttpError.validation("Identifiant manquant dans l'URL.");
    const result = db.prepare('DELETE FROM scores WHERE id = ?').run(id);
    if (result.changes === 0) throw HttpError.notFound('Partie déjà supprimée ou inexistante.');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});