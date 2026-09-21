import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-2xl text-amber-400">LEADERBOARD</h2>
      <p className="text-sm opacity-80">[M3 API scores will go here]</p>
      <Button variant="secondary" onClick={() => navigate('/')}>BACK</Button>
    </div>
  );
};