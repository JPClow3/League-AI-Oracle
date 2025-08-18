

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
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-800/50 rounded-lg overflow-hidden p-8">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-5">
            <defs>
                <pattern id="hex-loader-pattern" patternUnits="userSpaceOnUse" width="60" height="104" patternTransform="scale(1.5) rotate(30)">
                    <path d="M30 0L60 17.32v34.64L30 69.28 0 51.96V17.32z" fill="rgb(var(--color-accent-bg))" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex-loader-pattern)" />
        </svg>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[rgb(var(--color-accent-bg))] opacity-10 filter blur-3xl animate-[hex-scan_4s_ease-in-out_infinite]"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 border-4 border-[rgb(var(--color-accent-bg))] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-[rgb(var(--color-accent-text))] text-center animate-[pulse-text_2s_ease-in-out_infinite]">{messages[currentMessageIndex]}</p>
        </div>
    </div>
  );
};