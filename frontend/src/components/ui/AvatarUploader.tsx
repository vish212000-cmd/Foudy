import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
// FOUDY uses its own Toast, maybe? We'll just pass errors up or use simple console for now if Toast isn't available. Let's assume onUpload handles toasts, or we can use the parent.

interface AvatarUploaderProps {
    currentAvatarUrl?: string | null;
    fallbackText: string;
    onUpload: (file: File) => Promise<void>;
    disabled?: boolean;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function AvatarUploader({ currentAvatarUrl, fallbackText, onUpload, disabled }: AvatarUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            alert("Only PNG, JPG, and WEBP formats are supported.");
            return;
        }

        if (file.size > MAX_SIZE) {
            alert("File size must be less than 5MB.");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        try {
            setIsUploading(true);
            await onUpload(file);
        } catch (error) {
            console.error("Failed to upload avatar", error);
            setPreviewUrl(null); 
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; 
            }
        }
    };

    const getFullImageUrl = (path?: string | null) => {
        if (!path) return undefined;
        if (path.startsWith('http')) return path;
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/v1\/?$/, '');
        return `${baseUrl}${path}`;
    };

    const displayUrl = previewUrl || getFullImageUrl(currentAvatarUrl);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <Avatar className="h-[120px] w-[120px] border-4 border-surface shadow-xl transition-transform duration-200 group-hover:scale-[1.02]">
                    <AvatarImage src={displayUrl} alt="Avatar" className="object-cover" />
                    <AvatarFallback className="text-4xl bg-surface-active text-text-primary">
                        {fallbackText}
                    </AvatarFallback>
                </Avatar>
                
                <div 
                    onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
                    className={cn(
                        "absolute inset-0 rounded-full flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer",
                        (disabled || isUploading) && "cursor-not-allowed opacity-0 group-hover:opacity-0",
                        isUploading && "opacity-100 bg-black/40"
                    )}
                >
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                        <>
                            <Camera className="h-8 w-8 text-white mb-1" />
                            <span className="text-xs font-medium text-white">Change</span>
                        </>
                    )}
                </div>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    aria-hidden="true"
                />
            </div>
            
            <div className="text-center space-y-1">
                <p className="text-xs text-text-tertiary">JPG, PNG or WebP</p>
                <p className="text-xs text-text-tertiary">Max 5MB</p>
            </div>
        </div>
    );
}
