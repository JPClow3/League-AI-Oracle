import React from 'react';
import { IconProps } from './IconProps';

// Simplified Axe/Sword for Top Lane
export const TopLaneIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M18.7502 2.00037L10.8302 9.92037L12.9502 12.0404L20.8702 4.12037L18.7502 2.00037Z" />
    <path d="M9.41016 11.3304L2.95016 17.7904C2.56016 18.1804 2.56016 18.8104 2.95016 19.2004L4.80016 21.0504C5.19016 21.4404 5.82016 21.4404 6.21016 21.0504L12.6702 14.5904L9.41016 11.3304Z" />
    <path d="M12.9502 12.0404L10.8302 9.92037L13.9602 6.79037L17.2102 10.0404L12.9502 12.0404Z" opacity="0.6"/>
  </svg>
);
