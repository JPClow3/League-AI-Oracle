
import React from 'react';
import { IconProps } from './IconProps';

export const BeakerIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.25 2.25A.75.75 0 009.5 3v1.077c-.91.205-1.78.53-2.569.943a.75.75 0 00-.31 1.018l1.325 2.295A8.986 8.986 0 007.25 12v6.59l-1.405-1.405a.75.75 0 10-1.06 1.06L7 20.59V21a.75.75 0 00.75.75h8.5a.75.75 0 00.75-.75v-.41l2.215-2.215a.75.75 0 10-1.06-1.06L16.75 18.59V12a8.986 8.986 0 00-.546-3.667l1.325-2.295a.75.75 0 00-.31-1.018c-.79-.413-1.658-.738-2.569-.943V3a.75.75 0 00-.75-.75h-3.5zM9.75 10.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-1.5z" />
  </svg>
);