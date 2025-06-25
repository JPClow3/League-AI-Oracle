
import React from 'react';
import { IconProps } from './IconProps';

export const ShieldExclamationIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path fillRule="evenodd" d="M12.876.65a.75.75 0 00-1.752 0L.65 5.376a.75.75 0 00-.348.89l.577 1.348A11.95 11.95 0 0012 21.75a11.95 11.95 0 0011.122-14.136l.577-1.347a.75.75 0 00-.348-.891L12.876.65zM13.084 6.235a.75.75 0 00-1.5-.056v4.963a.75.75 0 101.5.056V6.235zM12 15.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V15.75z" clipRule="evenodd" />
  </svg>
);
