import React from 'react';
import { cn } from '../../lib/utils';
import { Text } from './Text';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  rightElement?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, containerClassName, label, error, rightElement, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <Text as="label" variant="label" className="text-text-primary">
            {label}
          </Text>
        )}
        <div className="relative w-full">
          <input
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-md border border-border-default bg-surface px-3 py-2 text-base md:text-sm text-text-primary ring-offset-canvas placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-border-strong",
              rightElement && "pr-10",
              error && "border-danger-bg focus-visible:ring-danger-bg",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-text-tertiary">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <Text variant="caption" className="text-danger-text font-medium">{error}</Text>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
