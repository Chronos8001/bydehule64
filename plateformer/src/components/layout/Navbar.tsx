import React from 'react';
import { Link } from 'react-router-dom';
export const Navbar: React.FC = () => (
  <nav className="site-nav" aria-label="Navigation principale">
    <Link to="/">HOME</Link>
    <Link to="/game">GAME</Link>
    <Link to="/leaderboard">SCORES</Link>
    <Link to="/rules">RULES</Link>
  </nav>
);