import React from 'react';
import { IconProps } from './IconProps';

export const FlaskConicalIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.928 21.75c-.945 0-1.841-.235-2.614-.666L3.82 18.451a2.25 2.25 0 01-.932-1.415V10.57a2.25 2.25 0 01.539-1.45L9.76 3.211A2.25 2.25 0 0111.928 2.25c.837 0 1.6.462 2.004 1.177l.05.086a2.25 2.25 0 001.182.984h.01a2.25 2.25 0 001.853-1.185l.051-.086A2.25 2.25 0 0120.082 2.25a2.25 2.25 0 012.168.961l5.493 5.912a2.25 2.25 0 01.539 1.45v6.483a2.25 2.25 0 01-.932 1.415l-5.493 2.634c-.773.43-1.669.666-2.614.666h-.001zM12 8.25a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5A.75.75 0 0012 8.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.875 19.125H13.11M9 12.75H15" />
  </svg>
);
