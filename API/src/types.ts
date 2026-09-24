/**
 * Types partagés entre l'API et le front React.
 * Copiez ce fichier dans `src/types/api.ts` côté React : les deux projets
 * parlent alors exactement le même langage.
 */

/** Une partie enregistrée : un joueur, un jeu, un score, un temps. */
export interface ScoreEntry {
  id: string;
  player: string;
  game: string;
  /** Points marqués (entier positif). */
  score: number;
  /** Durée de la partie en millisecondes. */
  durationMs: number;
  /** Date ISO 8601 (UTC). */
  createdAt: string;
}

/** Critère de classement : au score, au temps, ou à la date. */
export type SortKey = 'score' | 'time' | 'date';

export type SortOrder = 'asc' | 'desc';

/** Enveloppe générique de toute réponse paginée de l'API. */
export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/** Forme unique de toutes les erreurs renvoyées par l'API. */
export interface ApiErrorBody {
  error: {
    /** Code stable, utilisable dans un `switch` côté React. */
    code:
      | 'VALIDATION_ERROR'
      | 'NOT_FOUND'
      | 'RATE_LIMITED'
      | 'UNAUTHORIZED'
      | 'SERVER_ERROR'
      | 'SIMULATED_FAILURE';
    message: string;
    /** Erreurs champ par champ, pour les formulaires. */
    fields?: FieldError[];
  };
}

export interface FieldError {
  field: string;
  message: string;
}

/** Une ligne de classement : la meilleure partie d'un joueur. */
export interface LeaderboardRow {
  rank: number;
  player: string;
  score: number;
  durationMs: number;
  createdAt: string;
}

/** Statistiques agrégées d'un joueur. */
export interface PlayerStats {
  player: string;
  gamesPlayed: number;
  bestScore: number;
  averageScore: number;
  fastestMs: number;
  totalTimeMs: number;
  lastPlayedAt: string;
}

/** Un jeu recensé dans la base, avec son nombre de parties. */
export interface GameSummary {
  game: string;
  entries: number;
  bestScore: number;
}

/** Corps attendu par `POST /api/scores`. */
export interface CreateScoreInput {
  player: string;
  game: string;
  score: number;
  durationMs: number;
}
