import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, Check } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/auth';
import { AuthService } from '../services/auth';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { TagInput } from '../components/ui/TagInput';
import { CompletionProgress } from '../components/ui/CompletionProgress';
import { AvatarUploader } from '../components/ui/AvatarUploader';

const profileSchema = z.object({
    display_name: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name too long'),
    interests: z.array(z.string()),
    languages: z.array(z.string())
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSetup() {
    const { user, updateUser } = useAuthStore();
    const navigate = useNavigate();
    
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiSuccess, setApiSuccess] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            display_name: user?.profile?.display_name || '',
            interests: user?.profile?.interests || [],
            languages: user?.profile?.languages || []
        }
    });

    const score = user?.profile?.completion_score || 0;
    const isReady = score >= 70;

    const onSubmit = async (data: ProfileFormValues) => {
        setApiError(null);
        setApiSuccess(null);
        try {
            const updatedUser = await AuthService.updateProfile({
                display_name: data.display_name,
                interests: data.interests,
                languages: data.languages
            });
            updateUser(updatedUser);
            setApiSuccess('Progress saved successfully!');
        } catch (error: any) {
            setApiError(error.response?.data?.error || 'Failed to update profile.');
        }
    };

    const handleAvatarUpload = async (file: File) => {
        setApiError(null);
        setApiSuccess(null);
        try {
            const updatedUser = await AuthService.uploadAvatar(file);
            updateUser(updatedUser);
            setApiSuccess('Avatar uploaded successfully!');
        } catch (error: any) {
            setApiError(error.response?.data?.error || 'Failed to upload avatar.');
        }
    };

    const handleContinue = () => {
        if (isReady) {
            navigate('/home');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-canvas flex flex-col items-center py-12 px-6">
            <div className="w-full max-w-xl space-y-8">
                
                <div className="text-center space-y-3">
                    <Heading variant="h2" className="text-text-primary">Complete Your Profile</Heading>
                    <Text variant="body" className="text-text-secondary">
                        You need a score of at least 70% to start matchmaking.
                    </Text>
                </div>

                <div className="bg-surface border border-border-default p-6 sm:p-8 rounded-xl shadow-sm space-y-8">
                    
                    <CompletionProgress score={score} />

                    <div className="flex flex-col items-center gap-4">
                        <AvatarUploader 
                            currentAvatarUrl={user.profile.avatar}
                            fallbackText={user.profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
                            onUpload={handleAvatarUpload}
                        />
                        <Text variant="caption" className="text-text-tertiary">Upload an avatar (+10)</Text>
                    </div>

                    {apiError && (
                        <div className="p-3 bg-danger-bg/20 text-danger-text text-sm rounded-lg">
                            {apiError}
                        </div>
                    )}
                    {apiSuccess && (
                        <div className="p-3 bg-success-bg/20 text-success-text text-sm rounded-lg flex items-center gap-2">
                            <Check className="h-4 w-4" /> {apiSuccess}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <TextInput
                            id="setup_display_name"
                            label="Display Name (+15)"
                            placeholder="Your display name"
                            aria-invalid={!!errors.display_name}
                            error={errors.display_name?.message}
                            disabled={isSubmitting}
                            {...register('display_name')}
                        />

                        <Controller
                            control={control}
                            name="interests"
                            render={({ field }) => (
                                <div>
                                    <TagInput 
                                        label="Interests (+25)"
                                        placeholder="E.g. Tech, Music, Art"
                                        tags={field.value}
                                        onChange={field.onChange}
                                    />
                                    {errors.interests && (
                                        <Text variant="caption" className="text-danger-text mt-1">{errors.interests.message}</Text>
                                    )}
                                </div>
                            )}
                        />

                        <Controller
                            control={control}
                            name="languages"
                            render={({ field }) => (
                                <div>
                                    <TagInput 
                                        label="Languages (+15)"
                                        placeholder="E.g. English, Spanish"
                                        tags={field.value}
                                        onChange={field.onChange}
                                    />
                                    {errors.languages && (
                                        <Text variant="caption" className="text-danger-text mt-1">{errors.languages.message}</Text>
                                    )}
                                </div>
                            )}
                        />

                        <div className="flex flex-col gap-3 pt-4">
                            <Button 
                                type="submit"
                                variant="secondary" 
                                className="w-full"
                                disabled={isSubmitting || !isDirty}
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Progress'}
                            </Button>

                            <Button 
                                type="button"
                                variant="primary" 
                                className="w-full"
                                onClick={handleContinue}
                                disabled={!isReady}
                            >
                                Continue to FOUDY <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}
