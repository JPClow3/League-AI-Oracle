
import React from 'react';
import { IconProps } from './IconProps';

export const UsersIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M4.5 6.375a.75.75 0 01.75-.75h9a.75.75 0 01.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75H18a.75.75 0 01-.75.75V18a.75.75 0 01-.75.75h-9a.75.75 0 01-.75-.75v-2.25a.75.75 0 01-.75-.75H3.75a.75.75 0 01-.75-.75V9.375a.75.75 0 01.75-.75H6a.75.75 0 01.75-.75V6.375z" />
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3V12.75a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zm-3.75 5.25a3.75 3.75 0 017.5 0v3a4.5 4.5 0 01-4.5 4.5h-3a4.5 4.5 0 01-4.5-4.5v-3a3.75 3.75 0 013.75-3.75z" clipRule="evenodd" />
  </svg>
);
