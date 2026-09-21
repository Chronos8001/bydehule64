import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
export const Layout: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-slate-900 text-white font-mono">
    <Navbar />
    <main className="flex-1 flex flex-col items-center justify-center p-4"><Outlet /></main>
    <Footer />
  </div>
);