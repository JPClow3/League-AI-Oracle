
import React from 'react';

interface ErrorCardProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ title, message, onRetry }) => (
  <div className="bg-rose-600/10 dark:bg-rose-500/10 border-l-4 border-rose-600 dark:border-rose-500 text-rose-700 dark:text-rose-400 p-6 rounded-lg shadow-md max-w-lg mx-auto">
    <div className="flex">
      <div className="py-1">
        <svg className="h-6 w-6 text-rose-600 dark:text-rose-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div>
        <p className="font-bold font-display text-xl text-rose-800 dark:text-rose-300">{title}</p>
        <p className="text-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-rose-900/50 focus:ring-rose-500 transition-colors duration-200"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);