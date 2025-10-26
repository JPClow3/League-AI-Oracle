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

const HextechSpinner = () => (
    <svg width="64" height="64" viewBox="0 0 100 100" className="text-[hsl(var(--accent))]" xmlns="http://www.w3.org/2000/svg">
      {/* Outer spinning ring */}
      <circle
        cx="50" cy="50" r="45"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="282.7"
        strokeDashoffset="70.6"
        strokeLinecap="round"
        className="opacity-50"
        style={{ animation: 'rotate-outer 4s linear infinite' }}
      />
      {/* Inner counter-spinning ring */}
      <circle
        cx="50" cy="50" r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="188.5"
        strokeDashoffset="47.1"
        strokeLinecap="round"
        className="opacity-75"
        style={{ animation: 'rotate-inner 3s linear infinite' }}
      />
      {/* Pulsing core */}
      <circle
        cx="50" cy="50" r="12"
        fill="currentColor"
        style={{ animation: 'pulse-core 2s ease-in-out infinite' }}
      />
    </svg>
);

export const Loader = ({ messages = defaultMessages, interval = 2500 }: LoaderProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages, interval]);
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
            <HextechSpinner />
            <p className="text-lg font-medium text-[hsl(var(--text-secondary))] text-center">{messages[currentMessageIndex]}</p>
        </div>
    </div>
  );
};