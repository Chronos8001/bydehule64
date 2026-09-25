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
      <h1 className="home-title">bidule 64</h1>
      <div className="home-screen-heading">Select a Game</div>
      <div className="home-menu-buttons">
        <Button variant="menuGreen" onClick={() => navigate('/game')}>bidule Game</Button>
        <Button variant="menuGreen" onClick={() => navigate('/leaderboard')}>bidule score</Button>
        <Button variant="menuBlue" onClick={() => navigate('/rules')}>Aide</Button>
      </div>
    </div>
  );
};