import { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { AuthService } from '../services/auth';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { AvatarUploader } from '../components/ui/AvatarUploader';
import { TagInput } from '../components/ui/TagInput';
import { CompletionProgress } from '../components/ui/CompletionProgress';

export function Profile() {
    const { user, updateUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [displayName, setDisplayName] = useState(user?.profile?.display_name || '');
    const [bio, setBio] = useState(user?.profile?.bio || '');
    const [country, setCountry] = useState(user?.profile?.country || '');
    const [genderPref, setGenderPref] = useState(user?.profile?.gender_preference || '');
    
    const [interests, setInterests] = useState<string[]>(user?.profile?.interests || []);
    const [keywords, setKeywords] = useState<string[]>(user?.profile?.keywords || []);
    const [languages, setLanguages] = useState<string[]>(user?.profile?.languages || []);

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => setIsSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updatedUser = await AuthService.updateProfile({
                display_name: displayName,
                bio,
                country,
                gender_preference: genderPref,
                interests,
                keywords,
                languages
            });
            updateUser(updatedUser);
            setIsSuccess(true);
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

    if (!user) return null;

    return (
        <div className="min-h-screen bg-canvas p-6 sm:p-10 pb-24">
            <div className="max-w-3xl mx-auto space-y-10">
                <div className="space-y-2">
                    <Heading variant="h2" className="text-text-primary">Edit Profile</Heading>
                    <Text variant="body" className="text-text-secondary">
                        Manage your profile details, avatar, and matchmaking preferences.
                    </Text>
                </div>

                <div className="bg-surface border border-border-default rounded-xl p-6 sm:p-8 space-y-8">
                    
                    {/* Progress */}
                    <div>
                        <CompletionProgress score={user.profile.completion_score || 0} />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                        <div className="flex flex-col items-center gap-4">
                            <AvatarUploader 
                                currentAvatarUrl={user.profile.avatar}
                                fallbackText={user.profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
                                onUpload={handleAvatarUpload}
                            />
                        </div>

                        <div className="flex-1 space-y-6 w-full">
                            <TextInput
                                id="display_name"
                                label="Display Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text-primary">Bio</label>
                                <textarea
                                    className="w-full min-h-[100px] p-3 rounded-lg border border-border-default bg-surface focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-sm text-text-primary placeholder:text-text-disabled transition-colors"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell others a bit about yourself..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextInput
                            id="country"
                            label="Country (ISO Code)"
                            placeholder="US, UK, CA, etc."
                            value={country}
                            onChange={(e) => setCountry(e.target.value.toUpperCase())}
                            maxLength={2}
                        />

                        <TextInput
                            id="gender_pref"
                            label="Gender Preference"
                            placeholder="Any, Male, Female, etc."
                            value={genderPref}
                            onChange={(e) => setGenderPref(e.target.value)}
                        />
                    </div>

                    <div className="space-y-6">
                        <TagInput 
                            label="Interests"
                            placeholder="Add an interest (e.g., Gaming, Tech) and press Enter"
                            tags={interests}
                            onChange={setInterests}
                        />

                        <TagInput 
                            label="Keywords"
                            placeholder="Add keywords (e.g., #startup, #fitness) and press Enter"
                            tags={keywords}
                            onChange={setKeywords}
                        />

                        <TagInput 
                            label="Languages"
                            placeholder="Add languages (e.g., English, Spanish) and press Enter"
                            tags={languages}
                            onChange={setLanguages}
                        />
                    </div>

                    <div className="pt-4 border-t border-border-default flex justify-end">
                        <Button 
                            variant="primary" 
                            size="md" 
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                isSuccess ? <><Check className="h-4 w-4 mr-2" /> Saved</> : 'Save Changes'
                            )}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}