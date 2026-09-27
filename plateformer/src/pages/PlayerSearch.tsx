import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import './Panel.css';

export function PlayerSearch() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState('');
  const [touched, setTouched] = useState(false);
  const error = player.trim() ? null : 'Saisissez un pseudo pour lancer la recherche.';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (error) return;
    navigate(`/players/${encodeURIComponent(player.trim())}`);
  };

  return (
    <section className="panel-screen">
      <h1 className="panel-title">Rechercher un joueur</h1>
      <form className="panel-section" onSubmit={handleSubmit}>
        <label className="search-field" htmlFor="player-search">
          Pseudo
          <input
            id="player-search"
            value={player}
            onChange={(event) => setPlayer(event.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={touched && Boolean(error)}
            aria-describedby={touched && error ? 'player-search-error' : undefined}
            placeholder="Ex. Link"
          />
        </label>
        {touched && error && <p id="player-search-error" className="panel-error">{error}</p>}
        <div className="panel-actions">
          <Button type="submit" disabled={Boolean(error)}>Rechercher</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/leaderboard')}>Classement</Button>
        </div>
      </form>
    </section>
  );
}