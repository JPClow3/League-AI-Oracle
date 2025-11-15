/**
 * Design Tokens
 * Centralized design constants for spacing, typography, and other design values
 */

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const TYPOGRAPHY = {
  h1: {
    fontSize: '2.5rem', // 40px
    lineHeight: '1.2',
    fontWeight: '700',
  },
  h2: {
    fontSize: '2rem', // 32px
    lineHeight: '1.25',
    fontWeight: '600',
  },
  h3: {
    fontSize: '1.5rem', // 24px
    lineHeight: '1.3',
    fontWeight: '600',
  },
  h4: {
    fontSize: '1.25rem', // 20px
    lineHeight: '1.4',
    fontWeight: '600',
  },
  body: {
    fontSize: '1rem', // 16px
    lineHeight: '1.5',
    fontWeight: '400',
  },
  small: {
    fontSize: '0.875rem', // 14px
    lineHeight: '1.5',
    fontWeight: '400',
  },
  tiny: {
    fontSize: '0.75rem', // 12px
    lineHeight: '1.4',
    fontWeight: '400',
  },
} as const;

export const ICON_SIZES = {
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
} as const;

export type SpacingKey = keyof typeof SPACING;
export type TypographyKey = keyof typeof TYPOGRAPHY;
export type IconSize = keyof typeof ICON_SIZES;
