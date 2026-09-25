import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { levels } from '../game/levels';
import './Panel.css';

export const LevelSelect: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="panel-screen">
      <h1 className="panel-title">Dev Mode</h1>

      <div className="panel-section">
        <h2>Sélection de niveau</h2>
        <p>
          Démarre directement au niveau choisi, dialogue d'introduction compris. Les pièces et le
          chrono repartent de zéro : les scores envoyés depuis ce mode ne reflètent pas une partie complète.
        </p>
      </div>

      <div className="level-grid">
        {levels.map((level, index) => (
          <button
            type="button"
            className="level-card"
            key={level.name}
            onClick={() => navigate(`/game?level=${index + 1}`)}
          >
            <span className="level-index">Niveau {index + 1}</span>
            <span className="level-name">{level.name}</span>
            <span className="level-summary">{level.summary}</span>
          </button>
        ))}
      </div>

      <div className="panel-actions">
        <Button variant="secondary" onClick={() => navigate('/rules')}>Retour aux options</Button>
      </div>
    </section>
  );
};
