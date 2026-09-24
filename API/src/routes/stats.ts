import { Router, type NextFunction, type Request, type Response } from 'express';
import { db } from '../db.js';
import { HttpError } from '../lib/http-error.js';
import { leaderboardQuerySchema } from '../schemas.js';
import type { GameSummary, LeaderboardRow, PlayerStats } from '../types.js';

export const statsRouter = Router();

/** GET /api/games — liste des jeux recensés. */
statsRouter.get('/games', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = db
      .prepare(
        `SELECT game, COUNT(*) AS entries, MAX(score) AS bestScore
         FROM scores GROUP BY game ORDER BY entries DESC, game ASC`,
      )
      .all() as unknown as GameSummary[];
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/leaderboard?game=snake&metric=score
 * Une seule ligne par joueur : sa meilleure partie.
 */
statsRouter.get('/leaderboard', (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = leaderboardQuerySchema.parse(req.query);
    const orderBy =
      query.metric === 'score'
        ? 'score DESC, duration_ms ASC, created_at ASC'
        : 'duration_ms ASC, score DESC, created_at ASC';

    const rows = db
      .prepare(
        `SELECT player, score, duration_ms AS durationMs, created_at AS createdAt
         FROM (
           SELECT *, ROW_NUMBER() OVER (PARTITION BY player ORDER BY ${orderBy}) AS rn
           FROM scores WHERE game = :game
         )
         WHERE rn = 1
         ORDER BY ${orderBy}
         LIMIT :limit`,
      )
      .all({ game: query.game, limit: query.limit }) as unknown as Omit<
        LeaderboardRow,
        'rank'
      >[];

    const data: LeaderboardRow[] = rows.map((row, index) => ({ rank: index + 1, ...row }));
    res.json({ data, meta: { game: query.game, metric: query.metric } });
  } catch (err) {
    next(err);
  }
});

/** GET /api/players/:player — statistiques agrégées d'un joueur. */
statsRouter.get('/players/:player', (req: Request, res: Response, next: NextFunction) => {
  try {
    const player = req.params.player;
    if (!player) throw HttpError.validation("Nom de joueur manquant dans l'URL.");
    const row = db
      .prepare(
        `SELECT player,
                COUNT(*)           AS gamesPlayed,
                MAX(score)         AS bestScore,
                ROUND(AVG(score))  AS averageScore,
                MIN(duration_ms)   AS fastestMs,
                SUM(duration_ms)   AS totalTimeMs,
                MAX(created_at)    AS lastPlayedAt
         FROM scores WHERE player = ? GROUP BY player`,
      )
      .get(player) as unknown as PlayerStats | undefined;

    if (!row) throw HttpError.notFound(`Aucune partie enregistrée pour « ${player} ».`);
    res.json(row);
  } catch (err) {
    next(err);
  }
});