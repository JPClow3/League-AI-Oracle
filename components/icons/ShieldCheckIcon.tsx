
import React from 'react';
import { IconProps } from './IconProps';

export const ShieldCheckIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path fillRule="evenodd" d="M12.876.65a.75.75 0 00-1.752 0L.65 5.376a.75.75 0 00-.348.89l.577 1.348A11.95 11.95 0 0012 21.75a11.95 11.95 0 0011.122-14.136l.577-1.347a.75.75 0 00-.348-.891L12.876.65zM11.25 8.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V8.25zm-.822 1.897a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.5-4.5a.75.75 0 10-1.06-1.06l-3.97 3.97-1.72-1.72z" clipRule="evenodd" />
  </svg>
);
