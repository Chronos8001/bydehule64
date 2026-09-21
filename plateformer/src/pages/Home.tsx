import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
export const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <h1 className="text-4xl text-amber-400">SUPER MARIO JS</h1>
      <div className="flex flex-col gap-4 w-64">
        <Button onClick={() => navigate('/game')}>START GAME</Button>
        <Button variant="secondary" onClick={() => navigate('/leaderboard')}>SCORES</Button>
        <Button variant="secondary" onClick={() => navigate('/rules')}>RULES</Button>
      </div>
    </div>
  );
};