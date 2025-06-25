
import React from 'react';
import { IconProps } from './IconProps';

// Content from your AllSeeingEyeIcon.tsx for OracleEyeIcon & EyeIcon
export const OracleEyeIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
};
export const EyeIcon: React.FC<IconProps> = OracleEyeIcon; // Alias for FocusModeEyeIcon

// Content from your BookOpenIcon.tsx for StrategyTomeIcon
export const StrategyTomeIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
};

// Content from your SparklesIcon.tsx for AISparkleIcon
export const AISparkleIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path fillRule="evenodd" d="M9.405 2.445a.75.75 0 01.021 1.06l-1.536 2.048a.75.75 0 00.033 1.033L9 7.5l-1.077 1.077a.75.75 0 00-1.06 1.06L9 11.25l-1.536 2.048a.75.75 0 101.082 1.033L10.5 12.45l1.06.021a.75.75 0 001.033-1.033L11.25 9l1.077-1.077a.75.75 0 00-1.06-1.06L9.75 9l1.536-2.048a.75.75 0 00-1.033-1.082L8.25 7.813 7.172 6.735a.75.75 0 00-1.06-1.06L4.065 7.723a.75.75 0 00-1.033.033L1.005 9.833a.75.75 0 001.082 1.033L4.135 9l2.048-1.536a.75.75 0 00.021-1.06L4.157 4.357a.75.75 0 00-1.033-1.082L1.075 5.323a.75.75 0 00.033 1.033L3.157 8.405a.75.75 0 001.06 1.06L6.265 7.42c.028-.028.05-.058.07-.09L7.5 6.075l.064.085a.75.75 0 00.18.257l1.32.942a.75.75 0 00.943-.18l.257-.18.085.064 1.237 1.125.085.076a.75.75 0 00.257.18l.942 1.32a.75.75 0 00.943-.18l.257-.18.085.064 1.237 1.125.085.076a.75.75 0 00.257.18l.942 1.32a.75.75 0 00.943-.18l.257-.18.085.064L21.94 9.405l.085-.077a.75.75 0 00.18-.257l.942-1.32a.75.75 0 00-.18-.943l-.18.257-.076-.085-1.125-1.237-.076-.085a.75.75 0 00-.257-.18l-1.32-.942a.75.75 0 00-.943.18l-.18.257-.064-.085-1.125-1.237-.064-.085a.75.75 0 00-.257-.18l-1.32-.942a.75.75 0 00-.943.18l-.257-.18L9.405 2.445z" clipRule="evenodd" />
    </svg>
  );
};

// Content from your NoSymbolIcon.tsx for BanIcon
export const BanIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
    </svg>
  );
};

// Heroicons EyeSlashIcon for EyeSlashIcon (FocusModeEyeSlashIcon)
export const EyeSlashIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
    </svg>
  );
};

// Content from your LinkIcon.tsx for SourceLinkIcon
export const SourceLinkIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
};

// Heroicons Squares2X2Icon for GridIcon (outline)
export const GridIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
};

// Heroicons ExclamationTriangleIcon for WarningIcon
export const WarningIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
};

// Content from your SwordIcon.tsx
export const SwordIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path fillRule="evenodd" d="M13.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-12 12a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l12-12a1 1 0 011.414 0zM12.586 5.414L5.414 12.586l4.293 4.293L18.586 8H17V6h1.586L12.586 5.414zM14 6v2h2V6h-2z" clipRule="evenodd" />
      <path d="M13.293 3.293l-10 10 1.414 1.414 10-10-1.414-1.414zM4 14.707l-1.707-1.707 10-10L13.707 4.293l-10 10zM17 6h-2v1.586l-2.707-2.707L13.707 3.293 19.414 9H17V6z" opacity="0.4"/>
      <path fillRule="evenodd" d="M6.037 15.638L4.05 13.651l.317-.317.001-.001c.783-.783.786-2.046.006-2.827l-.006-.006a1.999 1.999 0 00-2.828 0L1.22 10.817a.75.75 0 000 1.06l3.182 3.182H3a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75v-1.463zM18.715 3H17.25a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h1.463l-1.638 1.638a2.001 2.001 0 00.006 2.827l.006.006a2.001 2.001 0 002.827-.006l.316-.316.317-.317 1.987-1.987a.75.75 0 00-1.061-1.061L18.715 7.182V3z" clipRule="evenodd" opacity="0.6" />
    </svg>
  );
};

// Content from your BrokenShieldIcon.tsx
export const BrokenShieldIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 3.99L19 7.4V11C19 15.24 16.22 19.23 12 20.92C7.78 19.23 5 15.24 5 11V7.4L12 3.99Z" opacity="0.4"/>
      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM9.882 7.027L12 4.909l2.118 2.118-1.059 1.059L12 7.027l-1.059 1.059L9.882 7.027zM6.059 10.849L8.118 8.85l1.059 1.059-2.059 2.000L6.059 10.849zm10.823.000l-2.059-2.000 1.059-1.059 2.059 2.000-1.059 1.059zM12 20.909l-4.941-2.965V12.85l1.059-1.059 2.118 2.118L12 15.618l1.765-1.709 2.118-2.118L17.941 12.85v5.094L12 20.909z"/>
      <polygon points="11,10 9,12 11,14 15,10 13,8" fill="currentColor"/>
      <polygon points="13,14 15,12 13,10 9,14 11,16" fill="currentColor"/>
    </svg>
  );
};

// Content from your TargetIcon.tsx
export const TargetIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 1.5a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5zm0 3a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5zm0 3a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clipRule="evenodd" />
      <path d="M12 12.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V12.75z" fill="red" />
    </svg>
  );
};

// Corrected GoldenLaurelIcon using a simpler laurel wreath design
export const GoldenLaurelIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8 s8,3.59,8,8S16.41,20,12,20z" opacity="0.3" />
      <path d="M16.94,8.38C16.5,7.79,15.86,7.33,15.12,7.13C14.62,6.99,14.08,7.14,13.72,7.51L12,9.24l-1.72-1.73 C9.91,7.14,9.38,6.99,8.88,7.13C8.14,7.33,7.5,7.79,7.06,8.38C6.17,9.39,6.24,10.94,7.22,11.82l4.03,3.53 C11.51,15.58,11.75,15.67,12,15.67s0.49-0.09,0.75-0.31l4.03-3.53C17.76,10.94,17.83,9.39,16.94,8.38z"/>
    </svg>
  );
};


// New: GuardianShieldIcon for "Path of the Vanguard"
export const GuardianShieldIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path fillRule="evenodd" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" clipRule="evenodd" />
    </svg>
  );
};

// New: MagicOrbIcon for "Path of the Mage"
export const MagicOrbIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path fillRule="evenodd" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" clipRule="evenodd" opacity="0.3"/>
      <path fillRule="evenodd" d="M12 6a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8z" className="text-purple-400" clipRule="evenodd"/>
      <path fillRule="evenodd" d="M12 10a2 2 0 100 4 2 2 0 000-4z" className="text-purple-300" opacity="0.8" clipRule="evenodd"/>
    </svg>
  );
};

// New: HammerAnvilIcon for "The Armorer's Test"
export const HammerAnvilIcon: React.FC<IconProps> = ({ className, title }) => {
  const titleId = title ? `${title.replace(/\s+/g, '-')}-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"} aria-labelledby={titleId}>
      {title && <title id={titleId}>{title}</title>}
      <path fillRule="evenodd" d="M20.41 8.41l-3-3a3 3 0 00-4.24 0L12 6.59l-1.17-1.17a3 3 0 00-4.24 0l-3 3a3 3 0 000 4.24L4.76 13H3v8h6v-2H5v-4.59l.59-.58L8 12.41l1.17 1.18a1.5 1.5 0 002.12 0L12.47 12.41l2.36 2.36H14v2h6v-8h-1.76l1.17-1.17a3 3 0 000-4.24zM10.59 12L8 9.41l1.17-1.18L10.59 9.4l1.41-1.41L13.17 9l-2.58 2.59zM15.41 12L12.83 9.41l1.17-1.18L15.41 9.4l1.41-1.41L18 9l-2.59 2.59z" clipRule="evenodd"/>
      <path fillRule="evenodd" d="M5 17h14v2H5z" opacity="0.4" clipRule="evenodd"/>
    </svg>
  );
};
