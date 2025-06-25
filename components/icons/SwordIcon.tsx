import React from 'react';
import { IconProps } from './IconProps';

// Simple Sword Icon
export const SwordIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path fillRule="evenodd" d="M13.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-12 12a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l12-12a1 1 0 011.414 0zM12.586 5.414L5.414 12.586l4.293 4.293L18.586 8H17V6h1.586L12.586 5.414zM14 6v2h2V6h-2z" clipRule="evenodd" />
    <path d="M13.293 3.293l-10 10 1.414 1.414 10-10-1.414-1.414zM4 14.707l-1.707-1.707 10-10L13.707 4.293l-10 10zM17 6h-2v1.586l-2.707-2.707L13.707 3.293 19.414 9H17V6z" opacity="0.4"/>
     <path fillRule="evenodd" d="M6.037 15.638L4.05 13.651l.317-.317.001-.001c.783-.783.786-2.046.006-2.827l-.006-.006a1.999 1.999 0 00-2.828 0L1.22 10.817a.75.75 0 000 1.06l3.182 3.182H3a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75v-1.463zM18.715 3H17.25a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h1.463l-1.638 1.638a2.001 2.001 0 00.006 2.827l.006.006a2.001 2.001 0 002.827-.006l.316-.316.317-.317 1.987-1.987a.75.75 0 00-1.061-1.061L18.715 7.182V3z" clipRule="evenodd" opacity="0.6" />
  </svg>
);
// A simpler, more abstract sword/dagger
export const SimpleSwordIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M14.07 3.51L12.56 2H11.44L9.93 3.51L3.93 9.51L2 11.44V12.56L3.51 14.07L9.51 20.07L11.44 22H12.56L14.07 20.49L20.07 14.49L22 12.56V11.44L20.49 9.93L14.07 3.51ZM11.24 10.47L9.53 12.18L10.94 13.59L12.65 11.88L14.06 13.29L12.65 14.7L13.71 15.76L15.12 14.35L16.53 15.76L15.47 16.82L17.24 18.59L18.65 17.18L11.24 9.77V10.47Z"/>
  </svg>
);
