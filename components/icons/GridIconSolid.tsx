
import React from 'react';
import { IconProps } from './IconProps';

export const GridIconSolid: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
      <path fillRule="evenodd" d="M3 3.75A.75.75 0 013.75 3h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5A.75.75 0 013 8.25v-4.5zm0 9A.75.75 0 013.75 12h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5A.75.75 0 013 16.5v-4.5zm9-9A.75.75 0 0112.75 3h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5A.75.75 0 0112 8.25v-4.5zm9 9A.75.75 0 0121.75 12h-4.5a.75.75 0 01-.75-.75V6.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75.75v4.5a.75.75 0 01.75.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75V12z" clipRule="evenodd" />
  </svg>
);
