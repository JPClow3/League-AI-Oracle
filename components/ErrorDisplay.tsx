
import React from 'react';
import { WarningIcon } from './icons/index'; 

interface ErrorDisplayProps {
  errorMessage: string;
  onClear?: () => void; 
  title?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
    errorMessage, 
    onClear,
    title = "An Error Occurred" 
}) => {
  if (!errorMessage) return null;

  return (
    <div 
      className="mt-4 p-3 sm:p-4 bg-red-800 bg-opacity-70 text-red-200 border border-red-700 rounded-2xl shadow-md animate-fadeIn" 
      role="alert"
      aria-live="assertive" // Ensures screen readers announce the error immediately
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
            <WarningIcon className="w-6 h-6 mr-3 text-red-300 flex-shrink-0" />
            <div>
            <h5 className="font-semibold text-red-100">{title}</h5>
            <p className="text-sm">{errorMessage}</p>
            </div>
        </div>
        {onClear && (
          <button 
            onClick={onClear} 
            className="ml-4 p-1.5 rounded-xl text-red-300 hover:bg-red-700 hover:text-red-100 transition-colors text-sm"
            aria-label="Clear error message"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};