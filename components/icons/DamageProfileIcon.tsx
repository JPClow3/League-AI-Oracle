
import React from 'react';
import { IconProps } from './IconProps';

export const DamageProfileIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    {/* Flame part */}
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.056 9.75 9.75 0 00-1.738 5.899A8.25 8.25 0 003.75 14.25a8.25 8.25 0 001.99 5.242.75.75 0 001.27-.718 6.75 6.75 0 01.427-2.903 8.217 8.217 0 002.433-2.176.75.75 0 00-1.127-1.002 6.732 6.732 0 01-1.332-1.936 6.75 6.75 0 01-.624-2.887 8.25 8.25 0 011.839-5.618.75.75 0 00.116-1.15A.75.75 0 0012.963 2.286z" clipRule="evenodd" className="text-orange-500" />
    <path fillRule="evenodd" d="M10.5 17.25a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75z" clipRule="evenodd" className="text-orange-400" />
     {/* Sword part */}
    <path d="M16.5 3.75L12 8.25l1.5 1.5L18 5.25V3.75h-1.5zm0 0L15 2.25l-.75.75L15.75 4.5l.75-.75z" className="text-sky-500" opacity="0.7" />
    <path fillRule="evenodd" d="M14.07 3.51L12.56 2H11.44L9.93 3.51L3.93 9.51L2 11.44V12.56L3.51 14.07L9.51 20.07L11.44 22H12.56L14.07 20.49L20.07 14.49L22 12.56V11.44L20.49 9.93L14.07 3.51ZM11.24 10.47L9.53 12.18L10.94 13.59L12.65 11.88L14.06 13.29L12.65 14.7L13.71 15.76L15.12 14.35L16.53 15.76L15.47 16.82L17.24 18.59L18.65 17.18L11.24 9.77V10.47Z" clipRule="evenodd" className="text-sky-400" transform="translate(2, 0) scale(0.85)"/>

  </svg>
);