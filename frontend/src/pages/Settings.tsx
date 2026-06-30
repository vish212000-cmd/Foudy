import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Bell, Shield, Paintbrush, ShieldAlert, 
  Monitor, Moon, Sun, Loader2, Check
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { AuthService } from '../services/auth';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Switch } from '../components/ui/Switch';
import { cn } from '../lib/utils';

type SettingsTab = 'account' | 'notifications' | 'appearance' | 'security' | 'danger';

type TabDef = { id: string, label: string, icon: any, danger?: boolean };

export function Settings() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!user) return null;

  const tabs: TabDef[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Paintbrush },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: ShieldAlert, danger: true }
  ];

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

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-lg font-medium text-text-primary">Account Details</h3>
              <p className="text-sm text-text-secondary">Manage your email and base account settings.</p>
            </div>
            
            <div className="bg-surface rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Email Address</h4>
                    <p className="text-sm text-text-tertiary mt-1">
                      {user.is_guest ? "You are using a temporary guest account." : user.email}
                    </p>
                  </div>
                  {!user.is_guest && <Button variant="secondary" size="sm">Edit</Button>}
                </div>

                {user.is_guest && (
                  <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-brand-primary mb-2">Upgrade Account</h4>
                    <p className="text-sm text-text-secondary mb-4">
                      Claim this account by providing an email and password to save your progress permanently.
                    </p>
                    
                    {error && (
                      <div className="mb-4 p-3 bg-danger-bg/20 text-danger-text text-sm rounded-lg">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="mb-4 p-3 bg-success-bg/20 text-success-text text-sm rounded-lg flex items-center gap-2">
                        <Check className="h-4 w-4" /> {success}
                      </div>
                    )}

                    <form onSubmit={handleUpgrade} className="space-y-4 max-w-sm">
                      <TextInput
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                      <PasswordInput
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upgrade Account"}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      
      case 'notifications':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-text-primary">Notifications</h3>
              <p className="text-sm text-text-secondary">Configure how you receive alerts.</p>
            </div>
            
            <div className="bg-surface rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-sm divide-y divide-[rgba(255,255,255,0.04)]">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-text-primary">New Match Requests</h4>
                  <p className="text-sm text-text-tertiary">Get notified when someone wants to match with you.</p>
                </div>
                <Switch 
                  checked={user.profile.notification_settings?.matches ?? true} 
                  onCheckedChange={async (checked) => {
                      try {
                          const updatedUser = await AuthService.updateProfile({ 
                              profile: { 
                                  notification_settings: { 
                                      ...(user.profile.notification_settings || {}), 
                                      matches: checked 
                                  }
                              }
                          });
                          updateUser(updatedUser);
                      } catch (e) {
                          console.error("Failed to update settings", e);
                      }
                  }} 
                />
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Direct Messages</h4>
                  <p className="text-sm text-text-tertiary">Receive alerts for new messages.</p>
                </div>
                <Switch 
                  checked={user.profile.notification_settings?.messages ?? true} 
                  onCheckedChange={async (checked) => {
                      try {
                          const updatedUser = await AuthService.updateProfile({ 
                              profile: { 
                                  notification_settings: { 
                                      ...(user.profile.notification_settings || {}), 
                                      messages: checked 
                                  }
                              }
                          });
                          updateUser(updatedUser);
                      } catch (e) {
                          console.error("Failed to update settings", e);
                      }
                  }} 
                />
              </div>
            </div>
          </motion.div>
        );
        
      case 'appearance':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-text-primary">Appearance</h3>
              <p className="text-sm text-text-secondary">Customize the look and feel of FOUDY.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button className="flex flex-col items-center justify-center p-6 border-2 border-brand-primary bg-surface rounded-xl text-brand-primary">
                <Moon className="h-8 w-8 mb-3" />
                <span className="text-sm font-medium">Dark (Premium)</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 border-2 border-border-default bg-surface hover:bg-surface-hover rounded-xl text-text-secondary hover:text-text-primary transition-colors cursor-not-allowed opacity-50">
                <Sun className="h-8 w-8 mb-3" />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 border-2 border-border-default bg-surface hover:bg-surface-hover rounded-xl text-text-secondary hover:text-text-primary transition-colors cursor-not-allowed opacity-50">
                <Monitor className="h-8 w-8 mb-3" />
                <span className="text-sm font-medium">System</span>
              </button>
            </div>
          </motion.div>
        );

      case 'danger':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-danger-text">Danger Zone</h3>
              <p className="text-sm text-text-secondary">Irreversible and destructive actions.</p>
            </div>
            
            <div className="bg-surface rounded-xl border border-danger-bg/30 overflow-hidden shadow-sm">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Delete Account</h4>
                    <p className="text-sm text-text-tertiary mt-1">
                      Permanently remove your account, profile, and all chat history. This cannot be undone.
                    </p>
                  </div>
                  <Button variant="destructive" className="shrink-0">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-text-tertiary">Work in progress...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id 
                    ? (tab.danger ? "bg-danger-bg/20 text-danger-text" : "bg-brand-primary/10 text-brand-primary")
                    : (tab.danger ? "text-danger-text/70 hover:bg-danger-bg/10 hover:text-danger-text" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary")
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <main className="flex-1 max-w-3xl">
          <AnimatePresence mode="wait">
            <div key={activeTab}>
              {renderContent()}
            </div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
