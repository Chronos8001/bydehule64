import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/http-error.js';

const WINDOW_MS = 60_000;
const MAX_WRITES = 30;

const hits = new Map<string, { count: number; resetAt: number }>();

/** Protège les écritures d'un spam trivial (suffisant pour un projet d'école). */
export function writeRateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip ?? 'inconnu';
  const now = Date.now();
  const current = hits.get(key);

  if (!current || current.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  current.count += 1;
  if (current.count > MAX_WRITES) {
    res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
    next(
      new HttpError(
        429,
        'RATE_LIMITED',
        'Trop de scores envoyés en peu de temps. Réessayez dans une minute.',
      ),
    );
    return;
  }

  next();
}
