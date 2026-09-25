import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import './Panel.css';

const CONTROLS = [
  { keys: ['←', '→'], alt: ['A', 'D'], label: 'Se déplacer' },
  { keys: ['↑'], alt: ['W', 'Espace'], label: 'Sauter' },
  { keys: ['Entrée'], alt: [], label: 'Passer les dialogues' },
];

export const Rules: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="panel-screen">
      <h1 className="panel-title">Options</h1>

      <div className="panel-section">
        <h2>Commandes</h2>
        {CONTROLS.map((control) => (
          <div className="control-row" key={control.label}>
            <span className="control-keys">
              {[...control.keys, ...control.alt].map((key) => (
                <kbd key={key}>{key}</kbd>
              ))}
            </span>
            <span className="control-label">{control.label}</span>
          </div>
        ))}
      </div>

      <div className="panel-section">
        <h2>Objectif</h2>
        <ul className="panel-list">
          <li>Atteindre la porte tout à droite pour terminer un niveau.</li>
          <li>Les squelettes s'éliminent en leur sautant sur la tête, mais attention à ne pas les toucher autrement.</li>
          <li>Les pics, les lances flammes et une chute dans le vide sont mortels.</li>
          <li>Les lances flammes s'activent par cycles, observez leur rythme pour passer sans danger.</li>
          <li>Observez bien les pièges et les ennemis pour anticiper leurs mouvements.</li>
          <li>Collectez les pièces pour augmenter votre score.</li>
          <li>Le boss encaisse trois coups sur la tête et garde la porte fermée jusqu'à sa mort.</li>
          <li>Il tire trois salves de boules de feu de chaque côté, puis une gerbe en arc de cercle.</li>
          <li>Évitez de mourir pour ne pas perdre votre progression dans le niveau.</li>
        </ul>
      </div>

      <div className="panel-section">
        <h2>Score</h2>
        <ul className="panel-list">
          <li>Une pièce ramassée vaut 100 points.</li>
          <li>Un niveau terminé vaut 500 points.</li>
          <li>Le chrono tourne sur toute la partie et départage les ex æquo.</li>
          <li>À la mort, entrez un pseudo pour rejoindre le classement.</li>
        </ul>
      </div>

      <div className="panel-actions">
        <Button variant="primary" onClick={() => navigate('/dev')}>
          Dev Mode<span className="dev-badge">Debug</span>
        </Button>
        <Button variant="secondary" onClick={() => navigate('/')}>Retour</Button>
      </div>
    </section>
  );
};