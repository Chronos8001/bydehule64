import React from 'react';
import { Link } from 'react-router-dom';
export const Navbar: React.FC = () => (
  <nav className="p-4 bg-black/40 flex gap-4 text-xs">
    <Link to="/">HOME</Link>
    <Link to="/game">GAME</Link>
    <Link to="/leaderboard">SCORES</Link>
    <Link to="/rules">RULES</Link>
  </nav>
);