import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';

interface AvatarUploaderProps {
    currentAvatarUrl?: string | null;
    fallbackText: string;
    onUpload: (file: File) => Promise<void>;
    disabled?: boolean;
}

export function AvatarUploader({ currentAvatarUrl, fallbackText, onUpload, disabled }: AvatarUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optimistic preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        try {
            setIsUploading(true);
            await onUpload(file);
        } catch (error) {
            console.error("Failed to upload avatar", error);
            setPreviewUrl(null); // Revert preview on failure
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset input
            }
        }
    };

    const getFullImageUrl = (path?: string | null) => {
        if (!path) return undefined;
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path}`;
    };

    const displayUrl = previewUrl || getFullImageUrl(currentAvatarUrl);

    return (
        <div className="relative inline-block">
            <Avatar className="h-24 w-24 border-2 border-surface shadow-sm">
                <AvatarImage src={displayUrl} alt="Avatar" className="object-cover" />
                <AvatarFallback className="text-2xl">{fallbackText}</AvatarFallback>
            </Avatar>
            
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className={cn(
                    "absolute bottom-0 right-0 p-2 rounded-full bg-brand-primary text-white shadow-md transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary",
                    (disabled || isUploading) && "opacity-50 cursor-not-allowed"
                )}
                aria-label="Upload new avatar"
            >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                aria-hidden="true"
            />
        </div>
    );
}
