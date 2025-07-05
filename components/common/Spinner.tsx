
import React from 'react';

export const Spinner: React.FC<{ size?: string }> = ({ size = 'h-8 w-8' }) => (
  <div className={`animate-spin rounded-full ${size} border-b-2 border-t-2 border-primary-light dark:border-primary-dark`} />
);