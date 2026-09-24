import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/http-error.js';

const MAX_DELAY_MS = 8000;

/**
 * Permet de provoquer en direct un chargement lent ou une panne réseau,
 * ce que la soutenance demande explicitement de savoir montrer.
 *
 *   GET /api/scores?__delay=3000   -> répond au bout de 3 secondes
 *   GET /api/scores?__fail=500     -> répond une erreur 500
 *   GET /api/scores?__fail=1       -> équivalent à __fail=500
 *
 * Désactivable en production avec CHAOS_ENABLED=false.
 */
export function chaos(req: Request, _res: Response, next: NextFunction): void {
  if (process.env.CHAOS_ENABLED === 'false') {
    next();
    return;
  }

  const failRaw = req.query['__fail'];
  if (typeof failRaw === 'string') {
    const parsed = Number.parseInt(failRaw, 10);
    const status = Number.isFinite(parsed) && parsed >= 400 && parsed <= 599 ? parsed : 500;
    next(
      new HttpError(
        status,
        'SIMULATED_FAILURE',
        'Panne simulée à la demande du client (paramètre __fail).',
      ),
    );
    return;
  }

  const delayRaw = req.query['__delay'];
  if (typeof delayRaw === 'string') {
    const parsed = Number.parseInt(delayRaw, 10);
    const delay = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), MAX_DELAY_MS) : 0;
    setTimeout(next, delay);
    return;
  }

  next();
}
