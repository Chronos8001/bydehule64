import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useApiResource } from '../hooks/useApiResource';
import { getScore } from '../services/api';
import './Panel.css';

export function ScoreDetail() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { state, reload } = useApiResource((signal) => getScore(id, signal), [id]);

  return (
    <section className="panel-screen">
      <h1 className="panel-title">Détail de la partie</h1>
      {state.status === 'loading' && <p>Chargement de la partie…</p>}
      {state.status === 'error' && (
        <p role="alert" className="panel-alert">
          Impossible de charger cette partie : {state.error.message}
          <Button variant="secondary" onClick={reload}>Réessayer</Button>
        </p>
      )}
      {state.status === 'success' && (
        <div className="panel-section">
          <p><strong>Joueur :</strong> {state.data.player}</p>
          <p><strong>Jeu :</strong> {state.data.game}</p>
          <p><strong>Score :</strong> {state.data.score}</p>
          <p><strong>Pièces :</strong> {state.data.coins}</p>
          <p><strong>Niveaux :</strong> {state.data.levels}</p>
          <p><strong>Durée :</strong> {Math.floor(state.data.durationMs / 1000)} secondes</p>
        </div>
      )}
      <div className="panel-actions">
        <Button variant="secondary" onClick={() => navigate('/leaderboard')}>Retour au classement</Button>
      </div>
    </section>
  );
}