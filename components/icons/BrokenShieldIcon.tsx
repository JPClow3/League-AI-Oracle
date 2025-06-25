import React from 'react';
import { IconProps } from './IconProps';

// Simple Broken Shield Icon
export const BrokenShieldIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 3.99L19 7.4V11C19 15.24 16.22 19.23 12 20.92C7.78 19.23 5 15.24 5 11V7.4L12 3.99Z" opacity="0.4"/>
    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM9.882 7.027L12 4.909l2.118 2.118-1.059 1.059L12 7.027l-1.059 1.059L9.882 7.027zM6.059 10.849L8.118 8.85l1.059 1.059-2.059 2.000L6.059 10.849zm10.823.000l-2.059-2.000 1.059-1.059 2.059 2.000-1.059 1.059zM12 20.909l-4.941-2.965V12.85l1.059-1.059 2.118 2.118L12 15.618l1.765-1.709 2.118-2.118L17.941 12.85v5.094L12 20.909z"/>
    <polygon points="11,10 9,12 11,14 15,10 13,8" fill="currentColor"/>
    <polygon points="13,14 15,12 13,10 9,14 11,16" fill="currentColor"/>
  </svg>
);
