import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { AuthService } from '../services/auth';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { TagInput } from '../components/ui/TagInput';
import { CompletionProgress } from '../components/ui/CompletionProgress';
import { AvatarUploader } from '../components/ui/AvatarUploader';

export function ProfileSetup() {
    const { user, updateUser } = useAuthStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [displayName, setDisplayName] = useState(user?.profile?.display_name || '');
    const [interests, setInterests] = useState<string[]>(user?.profile?.interests || []);
    const [languages, setLanguages] = useState<string[]>(user?.profile?.languages || []);

    const score = user?.profile?.completion_score || 0;
    const isReady = score >= 70;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updatedUser = await AuthService.updateProfile({
                display_name: displayName,
                interests,
                languages
            });
            updateUser(updatedUser);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        const updatedUser = await AuthService.uploadAvatar(file);
        updateUser(updatedUser);
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

                    <div className="space-y-6">
                        <TextInput
                            id="setup_display_name"
                            label="Display Name (+15)"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />

                        <TagInput 
                            label="Interests (+25)"
                            placeholder="E.g. Tech, Music, Art"
                            tags={interests}
                            onChange={setInterests}
                        />

                        <TagInput 
                            label="Languages (+15)"
                            placeholder="E.g. English, Spanish"
                            tags={languages}
                            onChange={setLanguages}
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button 
                            variant="secondary" 
                            className="w-full"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Progress'}
                        </Button>

                        <Button 
                            variant="primary" 
                            className="w-full"
                            onClick={handleContinue}
                            disabled={!isReady}
                        >
                            Continue to FOUDY <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}
