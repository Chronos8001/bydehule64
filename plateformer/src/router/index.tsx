// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Home } from '../pages/Home';
import { GamePage } from '../pages/GamePage';
import { Leaderboard } from '../pages/Leaderboard';
import { LevelSelect } from '../pages/LevelSelect';
import { Rules } from '../pages/Rules';
import { NotFound } from '../pages/NotFound';
import { ScoreDetail } from '../pages/ScoreDetail';
import { PlayerSearch } from '../pages/PlayerSearch';
import { PlayerStats } from '../pages/PlayerStats';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'game', element: <GamePage /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      { path: 'scores/:id', element: <ScoreDetail /> },
      { path: 'search', element: <PlayerSearch /> },
      { path: 'players/:player', element: <PlayerStats /> },
      { path: 'rules', element: <Rules /> },
      { path: 'dev', element: <LevelSelect /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);