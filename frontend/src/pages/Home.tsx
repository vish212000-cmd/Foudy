import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Radio, Users, Plus, ShieldAlert, Sparkles, Activity, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import api from '../services/api';
import { roomService } from '../services/RoomService';
import type { RoomMetadata } from '../types/room';

export function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalMatches: 0, roomsJoined: 0, timeTalked: '0m' });
  const [recentRooms, setRecentRooms] = useState<RoomMetadata[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsRes = await api.get('/users/me/stats/');
        if (statsRes.data) {
          setStats({
            totalMatches: statsRes.data.total_matches || statsRes.data.totalMatches || 0,
            roomsJoined: statsRes.data.rooms_joined || statsRes.data.roomsJoined || 0,
            timeTalked: statsRes.data.time_talked || statsRes.data.timeTalked || '0m'
          });
        }
      } catch (e) {
        console.warn('Could not fetch stats', e);
      }

      try {
        const rooms = await roomService.getRooms();
        // Assuming the endpoint returns all rooms, take top 3 for "recent" or something similar
        setRecentRooms(rooms.slice(0, 3));
      } catch (e) {
        console.warn('Could not fetch recent rooms', e);
      }
    }
    loadDashboardData();
  }, []);

  // Calculate profile completion
  const profile = user?.profile;
  let completedCount = 0;
  if (profile?.display_name && profile.display_name.length >= 3) completedCount++;
  if (profile?.avatar) completedCount++;
  if (profile?.country) completedCount++;
  if (profile?.gender_preference) completedCount++;
  if (profile?.interests && profile.interests.length >= 3) completedCount++;
  if (profile?.languages && profile.languages.length >= 1) completedCount++;
  if (profile?.bio && profile.bio.length > 5) completedCount++;
  
  const completionPercent = Math.round((completedCount / 7) * 100) || 0;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-surface border border-border-default shadow-xl p-8 md:p-12"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-brand-primary" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">
            Welcome back, <span className="text-brand-primary">{user?.profile?.display_name || 'User'}</span>
          </h1>
          <p className="text-text-secondary text-lg mb-8 max-w-xl leading-relaxed">
            Ready to meet interesting people from around the world? Jump into a random match or join a room to start talking.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="px-8 shadow-lg shadow-brand-primary/20" onClick={() => navigate('/match')}>
              <Radio className="mr-2 h-5 w-5" />
              Start Matching
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/rooms')}>
              Browse Rooms
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="md:col-span-8 space-y-6">
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-primary" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="hover:border-brand-primary/50 transition-colors cursor-pointer group" onClick={() => navigate('/match')}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Radio className="h-6 w-6" />
                </div>
                <CardTitle>Random Match</CardTitle>
                <CardDescription>Meet someone new based on your interests and preferences.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-success-text/50 transition-colors cursor-pointer group" onClick={() => navigate('/rooms')}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-success-bg/10 text-success-text flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Join Room</CardTitle>
                <CardDescription>Hop into a public voice or video room to chat with groups.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-text-primary/50 transition-colors cursor-pointer group border-dashed bg-transparent" onClick={() => navigate('/rooms/create')}>
              <CardHeader className="flex flex-col items-center justify-center text-center h-full py-8">
                <div className="h-12 w-12 rounded-full border-2 border-dashed border-border-strong text-text-tertiary flex items-center justify-center mb-2 group-hover:text-text-primary group-hover:border-text-primary transition-colors">
                  <Plus className="h-6 w-6" />
                </div>
                <CardTitle className="text-text-secondary group-hover:text-text-primary">Create Room</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <h2 className="text-xl font-semibold text-text-primary mt-8">Recent Conversations</h2>
          <div className="bg-surface rounded-xl border border-border-default divide-y divide-border-default overflow-hidden">
            {recentRooms.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <MessageSquare className="h-12 w-12 mx-auto text-border-strong mb-3" />
                <p>No recent conversations yet.</p>
                <Button variant="ghost" className="mt-2 text-brand-primary" onClick={() => navigate('/match')}>Start matching</Button>
              </div>
            ) : (
              recentRooms.map((room) => (
                <div key={room.id} className="p-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors flex justify-between items-center cursor-pointer" onClick={() => navigate(`/rooms/${room.id}`)}>
                  <div>
                    <h3 className="font-semibold text-text-primary">{room.settings?.name || 'Unnamed Room'}</h3>
                    <p className="text-sm text-text-secondary">{room.settings?.topic || 'General'}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-brand-primary">Join again</Button>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Sidebar Widgets */}
        <motion.div variants={itemVariants} className="md:col-span-4 space-y-6">
          
          {/* Profile Completion */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Profile Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between items-center text-sm">
                <span className="text-text-secondary">Completion</span>
                <span className="font-semibold text-brand-primary">{completionPercent}%</span>
              </div>
              <div className="w-full bg-surface-active rounded-full h-2.5 mb-6 overflow-hidden">
                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${completionPercent}%` }}></div>
              </div>
              <Button variant={completionPercent === 100 ? "secondary" : "primary"} className="w-full" onClick={() => navigate('/profile')}>
                {completionPercent === 100 ? 'Edit Profile' : 'Complete Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Total Matches</span>
                <span className="font-bold text-text-primary">{stats.totalMatches}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Rooms Joined</span>
                <span className="font-bold text-text-primary">{stats.roomsJoined}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Time Talked</span>
                <span className="font-bold text-text-primary">{stats.timeTalked}</span>
              </div>
            </CardContent>
          </Card>

          {/* Safety Tips */}
          <Card className="bg-brand-primary/5 border-brand-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-brand-primary">
                <ShieldAlert className="h-5 w-5" />
                <CardTitle className="text-base">Safety Tip</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary leading-relaxed">
                Never share personal information like your home address or phone number with strangers. Stay safe and have fun!
              </p>
            </CardContent>
          </Card>
          
        </motion.div>
      </motion.div>
    </div>
  );
}
