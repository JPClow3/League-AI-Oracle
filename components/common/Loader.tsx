

import React, { useState, useEffect } from 'react';

interface LoaderProps {
  messages?: string[];
  interval?: number;
}

const defaultMessages = [
    "Consulting the meta...",
    "Evaluating synergies...",
    "Calculating win conditions...",
    "Analyzing counter-picks...",
    "Finalizing assessment...",
];

export const Loader: React.FC<LoaderProps> = ({ messages = defaultMessages, interval = 2000 }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages, interval]);
  
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 bg-slate-800/50 rounded-lg">
       <div className="w-12 h-12 border-4 border-[rgb(var(--color-accent-bg))] border-t-transparent rounded-full animate-spin"></div>
       <p className="text-lg font-semibold text-[rgb(var(--color-accent-text))] text-center transition-opacity duration-300">{messages[currentMessageIndex]}</p>
    </div>
  );
};