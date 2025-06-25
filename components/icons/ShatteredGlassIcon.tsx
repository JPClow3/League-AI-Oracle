import React from 'react';
import { IconProps } from './IconProps';

export const ShatteredGlassIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className || "w-10 h-10 text-white opacity-60"}
  >
    {/* Central crack point */}
    <circle cx="50" cy="50" r="2" fill="currentColor" stroke="none" />

    {/* Major radiating cracks */}
    <line x1="50" y1="50" x2="10" y2="10" />
    <line x1="50" y1="50" x2="90" y2="10" />
    <line x1="50" y1="50" x2="10" y2="90" />
    <line x1="50" y1="50" x2="90" y2="90" />
    <line x1="50" y1="50" x2="50" y2="5" />
    <line x1="50" y1="50" x2="50" y2="95" />
    <line x1="50" y1="50" x2="5" y2="50" />
    <line x1="50" y1="50" x2="95" y2="50" />

    {/* Secondary cracks - creating jagged effect */}
    <line x1="30" y1="30" x2="40" y2="60" />
    <line x1="70" y1="30" x2="60" y2="60" />
    <line x1="30" y1="70" x2="40" y2="40" />
    <line x1="70" y1="70" x2="60" y2="40" />
    
    <line x1="20" y1="50" x2="45" y2="25" />
    <line x1="80" y1="50" x2="55" y2="25" />
    <line x1="20" y1="50" x2="45" y2="75" />
    <line x1="80" y1="50" x2="55" y2="75" />

    {/* Small fragments near edges */}
    <line x1="15" y1="15" x2="25" y2="10" />
    <line x1="85" y1="15" x2="75" y2="10" />
    <line x1="15" y1="85" x2="25" y2="90" />
    <line x1="85" y1="85" x2="75" y2="90" />
  </svg>
);