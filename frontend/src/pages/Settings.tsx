import React, { useState } from 'react';
import { Loader2, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { AuthService } from '../services/auth';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { PasswordInput } from '../components/ui/PasswordInput';

export function Settings() {
    const { user, updateUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleUpgrade = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const { user: updatedUser } = await AuthService.upgradeGuest({ email, password });
            updateUser(updatedUser);
            setSuccess('Account successfully upgraded!');
        } catch (err: any) {
            setError(err.response?.data?.email?.[0] || err.response?.data?.error || 'Failed to upgrade account.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-canvas p-6 sm:p-10 pb-24">
            <div className="max-w-2xl mx-auto space-y-10">
                <div className="space-y-2">
                    <Heading variant="h2" className="text-text-primary">Account Settings</Heading>
                    <Text variant="body" className="text-text-secondary">
                        Manage your account security and preferences.
                    </Text>
                </div>

                {user.is_guest ? (
                    <div className="bg-surface border border-brand-primary/20 rounded-xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
                        
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <Heading variant="h4" className="text-text-primary">Upgrade your account</Heading>
                                <Text variant="body" className="text-text-secondary">
                                    You are currently using a Guest account. Claim your account to save your profile, matches, and chat history permanently.
                                </Text>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleUpgrade} className="space-y-4 pt-4 border-t border-border-default">
                            <TextInput
                                id="upgrade_email"
                                label="Email address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                disabled={isLoading}
                                required
                            />
                            
                            <PasswordInput
                                id="upgrade_password"
                                label="Choose a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />

                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="w-full mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Upgrade Account'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-surface border border-border-default rounded-xl p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border-default">
                            <Mail className="h-5 w-5 text-text-secondary" />
                            <div>
                                <Text variant="label" className="text-text-primary">Registered Email</Text>
                                <Text variant="body" className="text-text-secondary font-medium">{user.email}</Text>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pb-4 border-b border-border-default">
                            <Lock className="h-5 w-5 text-text-secondary" />
                            <div>
                                <Text variant="label" className="text-text-primary">Password</Text>
                                <Text variant="body" className="text-text-secondary font-medium">********</Text>
                            </div>
                            <Button variant="secondary" size="sm" className="ml-auto">Change</Button>
                        </div>
                        {success && (
                            <div className="p-3 bg-success/10 text-success text-sm rounded-lg border border-success/20">
                                {success}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
