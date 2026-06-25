import { cn } from '../../lib/utils';
import React from 'react';

export type TextVariant = 'bodyLg' | 'body' | 'caption' | 'label';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  as?: React.ElementType;
}

export function Text({ className, variant = 'body', as = 'p', ...props }: TextProps) {
  const Comp = as;
  
  const variants = {
    bodyLg: 'text-lg leading-relaxed font-regular',
    body: 'text-base leading-normal font-regular',
    caption: 'text-sm leading-snug font-regular text-text-secondary',
    label: 'text-sm font-medium tracking-wide',
  };

  return (
    <Comp
      className={cn(variants[variant], className)}
      {...props}
    />
  );
}
