import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent mt-8 py-4">
      <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
        <p>DraftWise AI - Your Ultimate Strategic Co-Pilot</p>
        <p>&copy; {new Date().getFullYear()}. Not affiliated with Riot Games.</p>
      </div>
    </footer>
  );
};