import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboard, listGames } from '../services/api';
import { useApiResource } from '../hooks/useApiResource';
import type { SortKey } from '../types/api';

type Metric = Extract<SortKey, 'score' | 'time'>;

export function Leaderboard() {
  const [game, setGame] = useState<string>('');
  const [metric, setMetric] = useState<Metric>('score');

  // Premier appel : la liste des jeux, pour remplir le <select>.
  const gamesState = useApiResource((signal) => listGames(signal), []);

  // Second appel : le classement du jeu choisi. Ne part que si `game` est renseigné.
  const leaderboardState = useApiResource(
    (signal) => (game ? getLeaderboard(game, metric, signal) : Promise.resolve({ data: [] })),
    [game, metric],
  );

  // Dès que la liste des jeux arrive, on sélectionne le premier par défaut.
  if (gamesState.state.status === 'success' && game === '' && gamesState.state.data.data.length > 0) {
    setGame(gamesState.state.data.data[0]!.game);
  }

  return (
    <section>
      <h1>Leaderboard</h1>

      {gamesState.state.status === 'loading' && <p>Chargement des jeux…</p>}

      {gamesState.state.status === 'error' && (
        <p role="alert">
          Impossible de charger les jeux : {gamesState.state.error.message}{' '}
          <button onClick={gamesState.reload}>Réessayer</button>
        </p>
      )}

      {gamesState.state.status === 'success' && gamesState.state.data.data.length === 0 && (
        <p>Aucun jeu enregistré pour l'instant.</p>
      )}

      {gamesState.state.status === 'success' && gamesState.state.data.data.length > 0 && (
        <div>
          <label htmlFor="game-select">Jeu</label>
          <select
            id="game-select"
            value={game}
            onChange={(event) => setGame(event.target.value)}
          >
            {gamesState.state.data.data.map((g) => (
              <option key={g.game} value={g.game}>
                {g.game} ({g.entries} parties)
              </option>
            ))}
          </select>

          <label htmlFor="metric-select">Classer par</label>
          <select
            id="metric-select"
            value={metric}
            onChange={(event) => setMetric(event.target.value as Metric)}
          >
            <option value="score">Meilleur score</option>
            <option value="time">Temps le plus court</option>
          </select>
        </div>
      )}

      {leaderboardState.state.status === 'loading' && <p>Chargement du classement…</p>}

      {leaderboardState.state.status === 'error' && (
        <p role="alert">
          Erreur : {leaderboardState.state.error.message}{' '}
          <button onClick={leaderboardState.reload}>Réessayer</button>
        </p>
      )}

      {leaderboardState.state.status === 'success' && leaderboardState.state.data.data.length === 0 && game && (
        <p>Pas encore de score pour {game}.</p>
      )}

      {leaderboardState.state.status === 'success' && leaderboardState.state.data.data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Rang</th>
              <th>Joueur</th>
              <th>Score</th>
              <th>Temps</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardState.state.data.data.map((row) => (
              <tr key={`${row.rank}-${row.player}`}>
                <td>{row.rank}</td>
                <td>{row.player}</td>
                <td>{row.score}</td>
                <td>{(row.durationMs / 1000).toFixed(1)} s</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link to="/">Back</Link>
    </section>
  );
}
