import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-3xl text-red-500">404 - WORLD NOT FOUND</h2>
      <Button onClick={() => navigate('/')}>HOME</Button>
    </div>
  );
};