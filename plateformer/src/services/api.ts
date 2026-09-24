import type {
  ApiErrorBody,
  CreateScoreInput,
  FieldError,
  GameSummary,
  LeaderboardRow,
  Paginated,
  PlayerStats,
  ScoreEntry,
  SortKey,
  SortOrder,
} from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

/** Identifiant du jeu envoyé à l'API pour toutes les parties. */
export const GAME_NAME = 'dungeon-of-bydhule';

/** Métriques acceptées par `/api/leaderboard`. */
export type LeaderboardMetric = 'score' | 'time' | 'coins' | 'levels';

/** Erreur typée remontée aux composants : le formulaire lit `fields`. */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorBody['error']['code'];
  public readonly fields: FieldError[];

  constructor(status: number, code: ApiErrorBody['error']['code'], message: string, fields: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

/**
 * Générique écrit par le groupe : `request<T>` garantit que le type de retour
 * correspond à ce que la route promet, sans aucun `any`.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch (cause) {
    // fetch ne rejette que sur une vraie panne réseau (hors ligne, CORS, abort).
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiError(0, 'SERVER_ERROR', 'Serveur injoignable. Vérifiez votre connexion.');
  }

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const body = payload as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      body?.error.code ?? 'SERVER_ERROR',
      body?.error.message ?? 'Une erreur est survenue.',
      body?.error.fields ?? [],
    );
  }

  return payload as T;
}

export interface ListScoresParams {
  game?: string;
  player?: string;
  sort?: SortKey;
  order?: SortOrder;
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}

export function listScores({ signal, ...params }: ListScoresParams = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  return request<Paginated<ScoreEntry>>(`/scores?${search}`, { signal });
}

export function getScore(id: string, signal?: AbortSignal) {
  return request<ScoreEntry>(`/scores/${id}`, { signal });
}

export function createScore(input: CreateScoreInput) {
  return request<ScoreEntry>('/scores', { method: 'POST', body: JSON.stringify(input) });
}

export function getLeaderboard(game: string, metric: LeaderboardMetric, signal?: AbortSignal) {
  return request<{ data: LeaderboardRow[] }>(
    `/leaderboard?game=${encodeURIComponent(game)}&metric=${metric}`,
    { signal },
  );
}

export function listGames(signal?: AbortSignal) {
  return request<{ data: GameSummary[] }>('/games', { signal });
}

export function getPlayerStats(player: string, signal?: AbortSignal) {
  return request<PlayerStats>(`/players/${encodeURIComponent(player)}`, { signal });
}
