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

const CleanSpinner = () => (
    <svg className="animate-spin h-12 w-12 text-[hsl(var(--accent))]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            <CleanSpinner />
            <p className="text-lg font-medium text-[hsl(var(--text-secondary))] text-center">{messages[currentMessageIndex]}</p>
        </div>
    </div>
  );
};
