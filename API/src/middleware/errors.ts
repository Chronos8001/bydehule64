import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http-error.js';
import type { ApiErrorBody } from '../types.js';

/** Route inconnue : on renvoie la même enveloppe que les autres erreurs. */
export function notFound(req: Request, res: Response): void {
  const body: ApiErrorBody = {
    error: { code: 'NOT_FOUND', message: `Route inconnue : ${req.method} ${req.path}` },
  };
  res.status(404).json(body);
}

/** Dernier filet : toute erreur levée dans une route arrive ici. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json(err.toBody());
    return;
  }

  if (err instanceof ZodError) {
    const fields = err.issues.map((issue) => ({
      field: issue.path.join('.') || '_',
      message: issue.message,
    }));
    res.status(400).json(HttpError.validation('Données invalides.', fields).toBody());
    return;
  }

  console.error('[api] erreur non gérée :', err);
  const body: ApiErrorBody = {
    error: { code: 'SERVER_ERROR', message: 'Erreur interne du serveur.' },
  };
  res.status(500).json(body);
}
