import React from 'react';

export const InitialLoadingScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-slate-900 text-slate-300">
    <div className="relative w-48 h-48">
      <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full animate-ping"></div>
      <div className="absolute inset-4 border-4 border-indigo-500/50 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-full">
        <h1 className="text-5xl font-display font-bold text-gradient-primary">DW</h1>
      </div>
    </div>
    <p className="text-lg mt-8 tracking-wider animate-pulse">{message}</p>
  </div>
);
