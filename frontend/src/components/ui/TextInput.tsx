import React from 'react';
import { cn } from '../../lib/utils';
import { Text } from './Text';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, containerClassName, label, error, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <Text as="label" variant="label" className="text-text-primary">
            {label}
          </Text>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border bg-surface px-3 py-2 text-base md:text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
            error 
              ? "border-danger-bg focus-visible:ring-danger-bg" 
              : "border-border-default focus-visible:ring-brand-primary focus-visible:border-brand-primary hover:border-border-strong",
            className
          )}
          {...props}
        />
        {error && (
          <Text variant="caption" className="text-danger-text font-medium">{error}</Text>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
