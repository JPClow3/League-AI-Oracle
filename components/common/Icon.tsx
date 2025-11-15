import React from 'react';
import { ICON_SIZES, IconSize } from '../../lib/designTokens';
import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
  strokeWidth?: number;
}

export const Icon = ({ icon: IconComponent, size = 'md', className = '', strokeWidth = 1.5 }: IconProps) => {
  const iconSize = ICON_SIZES[size];
  
  return (
    <IconComponent
      className={className}
      size={parseInt(iconSize)}
      strokeWidth={strokeWidth}
    />
  );
};
