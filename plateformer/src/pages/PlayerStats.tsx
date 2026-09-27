import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useApiResource } from '../hooks/useApiResource';
import { getPlayerStats } from '../services/api';
import './Panel.css';

export function PlayerStats() {
  const navigate = useNavigate();
  const { player = '' } = useParams<{ player: string }>();
  const { state, reload } = useApiResource((signal) => getPlayerStats(player, signal), [player]);

  return (
    <section className="panel-screen">
      <h1 className="panel-title">Statistiques joueur</h1>
      {state.status === 'loading' && <p>Recherche en cours…</p>}
      {state.status === 'error' && (
        <div className="panel-section panel-alert" role="alert">
          <span>{state.error.message}</span>
          <Button variant="secondary" onClick={reload}>Réessayer</Button>
        </div>
      )}
      {state.status === 'success' && (
        <div className="panel-section">
          <h2>{state.data.player}</h2>
          <ul className="panel-list">
            <li>Parties jouées : {state.data.gamesPlayed}</li>
            <li>Meilleur score : {state.data.bestScore}</li>
            <li>Score moyen : {state.data.averageScore}</li>
            <li>Total de pièces : {state.data.totalCoins}</li>
            <li>Meilleur niveau : {state.data.bestLevels}</li>
          </ul>
        </div>
      )}
      <div className="panel-actions">
        <Button onClick={() => navigate('/search')}>Nouvelle recherche</Button>
        <Button variant="secondary" onClick={() => navigate('/leaderboard')}>Classement</Button>
      </div>
    </section>
  );
}