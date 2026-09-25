import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import './Layout.css';
export const Layout: React.FC = () => (
  <div className="site-shell">
    <Navbar />
    <main className="site-main"><Outlet /></main>
    <Footer />
  </div>
);