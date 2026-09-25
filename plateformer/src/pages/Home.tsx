import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useMenuAudio } from '../hooks/useMenuAudio';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { menuMusic, musicRef, startMenuMusic } = useMenuAudio();

  return (
    <div className="home-menu" onPointerDown={startMenuMusic}>
      <audio ref={musicRef} src={menuMusic} loop preload="auto" />
      <nav className="home-menu-buttons" aria-label="Menu principal">
        <Button variant="menuGreen" onClick={() => navigate('/game')}>Bidule game</Button>
        <Button variant="menuGreen" onClick={() => navigate('/leaderboard')}>Bidule score</Button>
        <Button variant="menuBlue" onClick={() => navigate('/rules')}>Aide</Button>
      </nav>
    </div>
  );
};