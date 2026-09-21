import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
export const GamePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <h2 className="text-2xl text-amber-400">WORLD 1-1 [M2 engine pending]</h2>
      <Button variant="danger" onClick={() => navigate('/')}>BACK TO MENU</Button>
    </div>
  );
};