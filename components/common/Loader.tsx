import { useState, useEffect } from 'react';

interface LoaderProps {
  messages?: string[];
  interval?: number;
  showProgress?: boolean; // Show multi-stage progress indicator
  currentStage?: number; // Current stage index (0-based)
  totalStages?: number; // Total number of stages
}

const defaultMessages = [
  'Consulting the meta...',
  'Evaluating synergies...',
  'Calculating win conditions...',
  'Analyzing counter-picks...',
  'Finalizing assessment...',
];

const HextechSpinner = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 100 100"
    className="text-[hsl(var(--accent))]"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer spinning ring */}
    <circle
      cx="50"
      cy="50"
      r="45"
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
      cx="50"
      cy="50"
      r="30"
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
    <circle cx="50" cy="50" r="12" fill="currentColor" style={{ animation: 'pulse-core 2s ease-in-out infinite' }} />
  </svg>
);

export const Loader = ({
  messages = defaultMessages,
  interval = 2500,
  showProgress = false,
  currentStage,
  totalStages,
}: LoaderProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages, interval]);

  // Calculate progress percentage
  const progress =
    showProgress && currentStage !== undefined && totalStages ? ((currentStage + 1) / totalStages) * 100 : null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 min-h-[400px]">
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 w-full max-w-md">
        <HextechSpinner />
        <p className="text-lg font-medium text-[hsl(var(--text-secondary))] text-center">
          {messages[currentMessageIndex]}
        </p>

        {/* Multi-stage progress indicator */}
        {showProgress && messages.length > 0 && (
          <div className="w-full space-y-2 mt-4">
            {/* Progress bar */}
            {progress !== null && (
              <div className="w-full bg-surface-inset rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Stage indicators */}
            <div className="flex justify-center gap-2 flex-wrap">
              {messages.map((_, index) => {
                const isActive = index === currentMessageIndex;
                const isCompleted = progress !== null && index < (currentStage ?? 0);

                return (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-accent scale-125'
                        : isCompleted
                          ? 'bg-accent opacity-60'
                          : 'bg-border-secondary opacity-30'
                    }`}
                    aria-label={`Stage ${index + 1}: ${messages[index]}`}
                  />
                );
              })}
            </div>

            {/* Stage counter */}
            {currentStage !== undefined && totalStages && (
              <p className="text-xs text-text-tertiary text-center">
                Stage {currentStage + 1} of {totalStages}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
