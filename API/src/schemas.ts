import { z } from 'zod';

const PLAYER_PATTERN = /^[\p{L}\p{N} _.-]+$/u;

/** Corps de `POST /api/scores`. Les messages sont en français : ils sont
 *  renvoyés tels quels au formulaire React, champ par champ. */
export const createScoreSchema = z.object({
  player: z
    .string({ required_error: 'Le pseudo est obligatoire.' })
    .trim()
    .min(2, 'Le pseudo doit faire au moins 2 caractères.')
    .max(20, 'Le pseudo ne peut pas dépasser 20 caractères.')
    .regex(PLAYER_PATTERN, 'Le pseudo contient des caractères interdits.'),
  game: z
    .string({ required_error: 'Le jeu est obligatoire.' })
    .trim()
    .min(2, 'Le nom du jeu doit faire au moins 2 caractères.')
    .max(40, 'Le nom du jeu ne peut pas dépasser 40 caractères.'),
  score: z
    .number({ invalid_type_error: 'Le score doit être un nombre.' })
    .int('Le score doit être un entier.')
    .min(0, 'Le score ne peut pas être négatif.')
    .max(1_000_000, 'Score irréaliste.'),
  durationMs: z
    .number({ invalid_type_error: 'La durée doit être un nombre.' })
    .int('La durée doit être un entier de millisecondes.')
    .min(0, 'La durée ne peut pas être négative.')
    .max(86_400_000, 'La durée ne peut pas dépasser 24 heures.'),
});

/** Query string de `GET /api/scores`. */
export const listScoresQuerySchema = z.object({
  game: z.string().trim().min(1).max(40).optional(),
  player: z.string().trim().min(1).max(20).optional(),
  sort: z.enum(['score', 'time', 'date']).default('score'),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const leaderboardQuerySchema = z.object({
  game: z.string().trim().min(1).max(40),
  metric: z.enum(['score', 'time']).default('score'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateScoreBody = z.infer<typeof createScoreSchema>;
export type ListScoresQuery = z.infer<typeof listScoresQuerySchema>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
