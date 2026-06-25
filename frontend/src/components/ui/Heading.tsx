import { cn } from '../../lib/utils';
import React from 'react';

export type HeadingVariant = 'display' | 'h1' | 'h2' | 'h3' | 'h4';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: HeadingVariant;
  as?: React.ElementType;
}

export function Heading({ className, variant = 'h2', as, ...props }: HeadingProps) {
  // Default to the matching semantic HTML element unless overridden
  const Component = as || (variant === 'display' ? 'h1' : variant);
  
  const variants = {
    display: 'text-5xl font-bold tracking-tighter leading-tight',
    h1: 'text-4xl font-bold tracking-tight leading-tight',
    h2: 'text-3xl font-semibold tracking-tight leading-snug',
    h3: 'text-2xl font-semibold tracking-tight leading-snug',
    h4: 'text-xl font-medium tracking-normal leading-normal',
  };

  return (
    <Component
      className={cn(variants[variant], className)}
      {...props}
    />
  );
}
