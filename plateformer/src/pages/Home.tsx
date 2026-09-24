import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="home-menu">
      <h1 className="home-title">bidule 64</h1>
      <div className="home-screen-heading">Select a Game</div>
      <div className="home-menu-buttons">
        <Button variant="menuGreen" onClick={() => navigate('/game')}>bidule Game</Button>
        <Button variant="menuGreen" onClick={() => navigate('/leaderboard')}>bidule score</Button>
        <Button variant="menuBlue" onClick={() => navigate('/rules')}>Options</Button>
      </div>
    </div>
  );
};