import React from 'react';
import { TYPOGRAPHY } from '../../lib/designTokens';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const createTypographyComponent = (
  tag: keyof JSX.IntrinsicElements,
  variant: keyof typeof TYPOGRAPHY,
  defaultClassName?: string
) => {
  const Component = ({ children, className = '', as, ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) => {
    const styles = TYPOGRAPHY[variant];
    const Tag = (as || tag) as keyof JSX.IntrinsicElements;
    
    return (
      <Tag
        className={`${defaultClassName || ''} ${className}`}
        style={{
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
          fontWeight: styles.fontWeight,
        }}
        {...props}
      >
        {children}
      </Tag>
    );
  };
  Component.displayName = tag;
  return Component;
};

export const H1 = createTypographyComponent('h1', 'h1', 'font-display text-[hsl(var(--text-primary))]');
export const H2 = createTypographyComponent('h2', 'h2', 'font-display text-[hsl(var(--text-primary))]');
export const H3 = createTypographyComponent('h3', 'h3', 'font-display text-[hsl(var(--text-primary))]');
export const H4 = createTypographyComponent('h4', 'h4', 'font-display text-[hsl(var(--text-primary))]');
export const Body = createTypographyComponent('p', 'body', 'text-[hsl(var(--text-primary))]');
export const Small = createTypographyComponent('span', 'small', 'text-[hsl(var(--text-secondary))]');
export const Tiny = createTypographyComponent('span', 'tiny', 'text-[hsl(var(--text-secondary))]');
