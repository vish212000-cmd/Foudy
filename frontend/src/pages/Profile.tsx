import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuthStore } from '../store/auth';
import { AuthService } from '../services/auth';
import { profileSchema, type ProfileFormValues } from '../lib/validations/profile';
import { countries } from '../lib/countries';
import { interestCategories, commonLanguages } from '../lib/interests';

import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { AvatarUploader } from '../components/ui/AvatarUploader';
import { Combobox } from '../components/ui/Combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { MultiSelect } from '../components/ui/MultiSelect';
import { Separator } from '../components/ui/Separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';

export function Profile() {
    const { user, updateUser } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: user?.profile?.display_name || '',
            bio: user?.profile?.bio || '',
            country: user?.profile?.country || '',
            genderPref: user?.profile?.gender_preference || '',
            interests: user?.profile?.interests || [],
            keywords: user?.profile?.keywords || [],
            languages: user?.profile?.languages || []
        },
        mode: 'onChange'
    });

    const { control, handleSubmit, watch, formState: { errors } } = form;

    // Watch all values for live preview and completion logic
    const watchedValues = watch();

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => setIsSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    const handleSave = async (data: ProfileFormValues) => {
        setIsSaving(true);
        try {
            const updatedUser = await AuthService.updateProfile({
                display_name: data.displayName,
                bio: data.bio || '',
                country: data.country,
                gender_preference: data.genderPref,
                interests: data.interests,
                keywords: data.keywords || [],
                languages: data.languages
            });
            updateUser(updatedUser);
            setIsSuccess(true);
        } catch (error) {
            console.error("Failed to update profile", error);
            // Optionally add toast here
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        const updatedUser = await AuthService.uploadAvatar(file);
        updateUser(updatedUser);
    };

    if (!user) return null;

    // Calculate Completion
    const completionItems = [
        { key: 'displayName', label: 'Display name', isComplete: !!watchedValues.displayName && watchedValues.displayName.length >= 3 },
        { key: 'avatar', label: 'Avatar', isComplete: !!user.profile?.avatar },
        { key: 'country', label: 'Country', isComplete: !!watchedValues.country },
        { key: 'genderPref', label: 'Gender Preference', isComplete: !!watchedValues.genderPref },
        { key: 'interests', label: 'Interests', isComplete: watchedValues.interests && watchedValues.interests.length >= 3 },
        { key: 'languages', label: 'Languages', isComplete: watchedValues.languages && watchedValues.languages.length >= 1 },
        { key: 'bio', label: 'Bio', isComplete: !!watchedValues.bio && watchedValues.bio.length > 5 }
    ];

    const completedCount = completionItems.filter(item => item.isComplete).length;
    const completionPercentage = Math.round((completedCount / completionItems.length) * 100);

    const countryOptions = countries.map(c => ({
        value: c.value,
        label: `${c.label} (${c.code})`,
        icon: <span className="mr-2">{c.flag}</span>
    }));

    const interestOptions = interestCategories.map(i => ({ value: i, label: i }));
    const languageOptions = commonLanguages.map(l => ({ value: l, label: l }));
    
    // Live preview avatar URL
    const getFullImageUrl = (path?: string | null) => {
        if (!path) return undefined;
        if (path.startsWith('http')) return path;
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/v1\/?$/, '');
        return `${baseUrl}${path}`;
    };
    const avatarUrl = getFullImageUrl(user.profile?.avatar);

    return (
        <div className="min-h-screen bg-[#070B13] p-4 sm:p-6 lg:p-10 pb-32">
            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="space-y-2 mb-8">
                    <Heading variant="h1" className="text-text-primary text-4xl font-bold">Complete Your Profile</Heading>
                    <Text variant="body" className="text-text-secondary text-lg">
                        Help others get to know you better. Complete your profile to start matching.
                    </Text>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left/Center Column: Profile Form */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Progress Card */}
                        <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[18px] p-8 space-y-6 shadow-xl">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-semibold text-text-primary">Profile Completion</h3>
                                <span className="text-brand-primary font-bold text-lg">{completionPercentage}%</span>
                            </div>
                            
                            <div className="w-full bg-surface-active rounded-full h-3 overflow-hidden">
                                <motion.div 
                                    className="bg-gradient-to-r from-[#3B82F6] to-[#4F46E5] h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionPercentage}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                            
                            <p className="text-sm text-text-secondary">
                                You need at least <span className="text-brand-primary font-medium">70%</span> to enter matchmaking.
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                                {completionItems.map(item => (
                                    <div key={item.key} className="flex items-center gap-2 text-sm">
                                        {item.isComplete ? (
                                            <div className="h-5 w-5 rounded-full bg-success-bg flex items-center justify-center">
                                                <Check className="h-3 w-3 text-success-text" />
                                            </div>
                                        ) : (
                                            <div className="h-5 w-5 rounded-full bg-surface-hover flex items-center justify-center border border-[rgba(255,255,255,0.08)]">
                                                <X className="h-3 w-3 text-text-tertiary" />
                                            </div>
                                        )}
                                        <span className={item.isComplete ? "text-text-primary" : "text-text-tertiary"}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Edit Form Card */}
                        <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[18px] p-8 shadow-xl">
                            <form id="profile-form" onSubmit={handleSubmit(handleSave)} className="space-y-8">
                                
                                <div className="flex flex-col sm:flex-row gap-10 items-start">
                                    <AvatarUploader 
                                        currentAvatarUrl={user.profile.avatar}
                                        fallbackText={watchedValues.displayName?.charAt(0)?.toUpperCase() || 'U'}
                                        onUpload={handleAvatarUpload}
                                    />

                                    <div className="flex-1 space-y-6 w-full">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-primary">Display Name</label>
                                            <Controller
                                                name="displayName"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextInput
                                                        {...field}
                                                        placeholder="VISH"
                                                        className="h-[48px] bg-surface border-[rgba(255,255,255,0.08)]"
                                                    />
                                                )}
                                            />
                                            {errors.displayName && <p className="text-xs text-danger-text mt-1">{errors.displayName.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-primary">Bio</label>
                                            <Controller
                                                name="bio"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="relative">
                                                        <textarea
                                                            {...field}
                                                            className="w-full min-h-[120px] p-4 rounded-lg border border-[rgba(255,255,255,0.08)] bg-surface focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm text-text-primary placeholder:text-text-tertiary transition-colors resize-y"
                                                            placeholder="Tell others a bit about yourself..."
                                                        />
                                                        <span className="absolute bottom-3 right-3 text-xs text-text-tertiary">
                                                            {field.value?.length || 0}/200
                                                        </span>
                                                    </div>
                                                )}
                                            />
                                            {errors.bio && <p className="text-xs text-danger-text mt-1">{errors.bio.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary">Country</label>
                                        <Controller
                                            name="country"
                                            control={control}
                                            render={({ field }) => (
                                                <Combobox
                                                    options={countryOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Select country"
                                                    searchPlaceholder="Search countries..."
                                                    className="bg-surface border-[rgba(255,255,255,0.08)]"
                                                />
                                            )}
                                        />
                                        {errors.country && <p className="text-xs text-danger-text mt-1">{errors.country.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary">Gender Preference</label>
                                        <Controller
                                            name="genderPref"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="bg-surface border-[rgba(255,255,255,0.08)]">
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Any">Any</SelectItem>
                                                        <SelectItem value="Male">Male</SelectItem>
                                                        <SelectItem value="Female">Female</SelectItem>
                                                        <SelectItem value="Non-Binary">Non-Binary</SelectItem>
                                                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.genderPref && <p className="text-xs text-danger-text mt-1">{errors.genderPref.message}</p>}
                                    </div>
                                </div>

                                <Separator className="bg-[rgba(255,255,255,0.04)] my-8" />

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary">Interests</label>
                                        <Controller
                                            name="interests"
                                            control={control}
                                            render={({ field }) => (
                                                <MultiSelect
                                                    options={interestOptions}
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Select interests..."
                                                    searchPlaceholder="Search or add custom..."
                                                    allowCustom={true}
                                                    className="bg-surface border-[rgba(255,255,255,0.08)]"
                                                />
                                            )}
                                        />
                                        {errors.interests && <p className="text-xs text-danger-text mt-1">{errors.interests.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary">Keywords (optional)</label>
                                        <Controller
                                            name="keywords"
                                            control={control}
                                            render={({ field }) => (
                                                <MultiSelect
                                                    options={[]}
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Add keywords (e.g., #startup, AI)..."
                                                    searchPlaceholder="Type and press enter..."
                                                    allowCustom={true}
                                                    emptyText="Type to add a keyword"
                                                    className="bg-surface border-[rgba(255,255,255,0.08)]"
                                                />
                                            )}
                                        />
                                        {errors.keywords && <p className="text-xs text-danger-text mt-1">{errors.keywords.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary">Languages</label>
                                        <Controller
                                            name="languages"
                                            control={control}
                                            render={({ field }) => (
                                                <MultiSelect
                                                    options={languageOptions}
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Select languages..."
                                                    searchPlaceholder="Search or add custom..."
                                                    allowCustom={true}
                                                    className="bg-surface border-[rgba(255,255,255,0.08)]"
                                                />
                                            )}
                                        />
                                        {errors.languages && <p className="text-xs text-danger-text mt-1">{errors.languages.message}</p>}
                                    </div>
                                </div>

                            </form>
                        </div>
                    </div>

                    {/* Right Column: Live Preview */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[18px] p-6 shadow-xl sticky top-8">
                            <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
                                </span>
                                Live Preview
                            </h3>
                            
                            <div className="bg-surface rounded-xl p-6 border border-[rgba(255,255,255,0.04)] space-y-6">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <Avatar className="h-24 w-24 border-2 border-[rgba(255,255,255,0.1)] shadow-lg">
                                        <AvatarImage src={avatarUrl} alt="Avatar" className="object-cover" />
                                        <AvatarFallback className="text-2xl bg-surface-active text-text-primary">
                                            {watchedValues.displayName?.charAt(0)?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div>
                                        <h4 className="text-xl font-bold text-text-primary">
                                            {watchedValues.displayName || 'Anonymous'}
                                        </h4>
                                        <p className="text-sm text-text-tertiary mt-1 flex items-center justify-center gap-1">
                                            {watchedValues.country && (
                                                <span>{countries.find(c => c.value === watchedValues.country)?.flag}</span>
                                            )}
                                            {watchedValues.country ? countries.find(c => c.value === watchedValues.country)?.label : 'No location'} 
                                            {watchedValues.genderPref && ` • ${watchedValues.genderPref}`}
                                        </p>
                                    </div>
                                </div>
                                
                                {watchedValues.bio && (
                                    <div className="pt-4 border-t border-[rgba(255,255,255,0.04)]">
                                        <p className="text-sm text-text-secondary leading-relaxed text-center italic">
                                            "{watchedValues.bio}"
                                        </p>
                                    </div>
                                )}
                                
                                {watchedValues.interests.length > 0 && (
                                    <div className="pt-4 border-t border-[rgba(255,255,255,0.04)] space-y-2">
                                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Interests</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {watchedValues.interests.map(interest => (
                                                <span key={interest} className="px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium border border-brand-primary/20">
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {watchedValues.languages.length > 0 && (
                                    <div className="pt-4 border-t border-[rgba(255,255,255,0.04)] space-y-2">
                                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Languages</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {watchedValues.languages.map(lang => (
                                                <span key={lang} className="px-2.5 py-1 rounded-full bg-surface-active text-text-secondary text-xs border border-[rgba(255,255,255,0.08)]">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#070B13]/80 backdrop-blur-md border-t border-[rgba(255,255,255,0.08)] p-4 z-40 transform transition-all">
                <div className="max-w-7xl mx-auto flex justify-end items-center gap-4">
                    {Object.keys(errors).length > 0 && (
                        <div className="flex items-center gap-2 text-danger-text text-sm mr-auto bg-danger-bg/20 px-3 py-1.5 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            <span>Please fix the errors above</span>
                        </div>
                    )}
                    <Button 
                        variant="ghost" 
                        size="lg"
                        className="text-text-secondary hover:text-text-primary px-6"
                        onClick={() => form.reset()}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button 
                        form="profile-form"
                        type="submit"
                        variant="primary" 
                        size="lg" 
                        className="px-8 font-medium shadow-lg shadow-brand-primary/20"
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            isSuccess ? <><Check className="h-5 w-5 mr-2" /> Saved</> : 'Save Changes'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}