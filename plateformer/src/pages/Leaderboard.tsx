import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { getLeaderboard, listGames, type LeaderboardMetric } from '../services/api';
import { useApiResource } from '../hooks/useApiResource';
import './Panel.css';

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
};

export function Leaderboard() {
  const navigate = useNavigate();
  const [game, setGame] = useState<string>('');
  const [metric, setMetric] = useState<LeaderboardMetric>('score');

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
    <section className="panel-screen">
      <h1 className="panel-title">Classement</h1>

      <div className="panel-section">
        <h2>Filtres</h2>

        {gamesState.state.status === 'loading' && <p>Chargement des jeux…</p>}

        {gamesState.state.status === 'error' && (
          <p role="alert" className="panel-alert">
            Impossible de charger les jeux : {gamesState.state.error.message}
            <Button variant="secondary" onClick={gamesState.reload}>Réessayer</Button>
          </p>
        )}

        {gamesState.state.status === 'success' && gamesState.state.data.data.length === 0 && (
          <p>Aucune partie enregistrée pour l'instant. Lancez une partie pour ouvrir le bal.</p>
        )}

        {gamesState.state.status === 'success' && gamesState.state.data.data.length > 0 && (
          <div className="panel-filters">
            <label htmlFor="game-select">
              Jeu
              <select id="game-select" value={game} onChange={(event) => setGame(event.target.value)}>
                {gamesState.state.data.data.map((g) => (
                  <option key={g.game} value={g.game}>
                    {g.game} ({g.entries} parties)
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="metric-select">
              Classer par
              <select id="metric-select" value={metric} onChange={(event) => setMetric(event.target.value as LeaderboardMetric)}>
                <option value="score">Meilleur score</option>
                <option value="coins">Plus de pièces</option>
                <option value="levels">Plus de niveaux</option>
                <option value="time">Temps le plus court</option>
              </select>
            </label>
          </div>
        )}
      </div>

      <div className="panel-section">
        <h2>Meilleures parties</h2>

        {leaderboardState.state.status === 'loading' && <p>Chargement du classement…</p>}

        {leaderboardState.state.status === 'error' && (
          <p role="alert" className="panel-alert">
            Erreur : {leaderboardState.state.error.message}
            <Button variant="secondary" onClick={leaderboardState.reload}>Réessayer</Button>
          </p>
        )}

        {leaderboardState.state.status === 'success' && leaderboardState.state.data.data.length === 0 && game && (
          <p>Pas encore de score pour {game}.</p>
        )}

        {leaderboardState.state.status === 'success' && leaderboardState.state.data.data.length > 0 && (
          <div className="score-table-wrap">
            <table className="score-table">
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Joueur</th>
                  <th>Score</th>
                  <th>Pièces</th>
                  <th>Niveaux</th>
                  <th>Temps</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardState.state.data.data.map((row) => (
                  <tr key={`${row.rank}-${row.player}`} data-podium={row.rank <= 3}>
                    <td className="rank-cell">{row.rank}</td>
                    <td>{row.player}</td>
                    <td>{row.score}</td>
                    <td>{row.coins}</td>
                    <td>{row.levels}</td>
                    <td>{formatTime(row.durationMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel-actions">
        <Button variant="primary" onClick={() => navigate('/game')}>Jouer</Button>
        <Button variant="secondary" onClick={() => navigate('/')}>Retour</Button>
      </div>
    </section>
  );
}
