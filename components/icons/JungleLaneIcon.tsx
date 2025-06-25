import React from 'react';
import { IconProps } from './IconProps';

// Simplified Leaf/Claw for Jungle
export const JungleLaneIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M12 2C11.1 2 9.81 3.32 8.35 5.5C5.66 9.47 5.06 13.34 6.91 17.5C7.38 18.44 8.09 19.26 9 19.88V22H15V19.88C15.91 19.26 16.62 18.44 17.09 17.5C18.94 13.34 18.34 9.47 15.65 5.5C14.19 3.32 12.9 2 12 2ZM12 4.09C12.33 4.54 12.87 5.37 13.59 6.5C15.63 9.44 16.03 12.44 14.91 15.5C14.59 16.41 14.06 17.18 13.36 17.77C12.92 18.14 12.47 18.43 12 18.64C11.53 18.43 11.08 18.14 10.64 17.77C9.94 17.18 9.41 16.41 9.09 15.5C7.97 12.44 8.37 9.44 10.41 6.5C11.13 5.37 11.67 4.54 12 4.09Z"/>
  </svg>
);
