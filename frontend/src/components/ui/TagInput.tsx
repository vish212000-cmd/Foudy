import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Text } from './Text';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
}

export function TagInput({ tags, onChange, placeholder = 'Add tag...', label, error, disabled }: TagInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                onChange([...tags, newTag]);
            }
            setInputValue('');
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    };

    const removeTag = (indexToRemove: number) => {
        if (disabled) return;
        onChange(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-sm font-medium text-text-primary">
                    {label}
                </label>
            )}
            <div className={cn(
                "min-h-[2.5rem] p-1.5 bg-surface border rounded-lg flex flex-wrap gap-1.5 items-center transition-colors",
                error ? "border-destructive focus-within:ring-1 focus-within:ring-destructive focus-within:border-destructive" 
                      : "border-border-default focus-within:ring-1 focus-within:ring-brand-primary focus-within:border-brand-primary",
                disabled && "opacity-50 cursor-not-allowed bg-surface-hover"
            )}>
                {tags.map((tag, index) => (
                    <span 
                        key={index}
                        className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-md text-sm font-medium"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            disabled={disabled}
                            className="text-brand-primary/70 hover:text-brand-primary focus:outline-none"
                            aria-label={`Remove tag ${tag}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-disabled py-1 px-1"
                />
            </div>
            {error && (
                <Text variant="caption" className="text-destructive mt-1">
                    {error}
                </Text>
            )}
        </div>
    );
}
