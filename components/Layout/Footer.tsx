import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-8 py-6 border-t border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-4 text-center text-[hsl(var(--text-muted))] text-xs">
        <p>DraftWise AI - Your Ultimate Strategic Co-Pilot</p>
        <p>&copy; {new Date().getFullYear()}. Not affiliated with Riot Games, Inc. or LoL Esports.</p>
      </div>
    </footer>
  );
};
