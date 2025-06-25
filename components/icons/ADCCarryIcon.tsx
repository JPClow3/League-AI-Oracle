import React from 'react';
import { IconProps } from './IconProps';

// Simplified Bow and Arrow for ADC
export const ADCCarryIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M22.7071 1.29289C22.3166 0.902369 21.6834 0.902369 21.2929 1.29289L12 10.5858L2.70711 1.29289C2.31658 0.902369 1.68342 0.902369 1.29289 1.29289C0.902369 1.68342 0.902369 2.31658 1.29289 2.70711L10.5858 12L1.29289 21.2929C0.902369 21.6834 0.902369 22.3166 1.29289 22.7071C1.68342 23.0976 2.31658 23.0976 2.70711 22.7071L12 13.4142L21.2929 22.7071C21.6834 23.0976 22.3166 23.0976 22.7071 22.7071C23.0976 22.3166 23.0976 21.6834 22.7071 21.2929L13.4142 12L22.7071 2.70711C23.0976 2.31658 23.0976 1.68342 22.7071 1.29289Z"/>
    <path d="M12 3V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
    <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
  </svg>
);
