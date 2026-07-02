import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Hash, Search, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { roomService } from '../services/RoomService';
import type { RoomMetadata } from '../types/room';

export function Rooms() {
  const [rooms, setRooms] = useState<RoomMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'public' | 'private'>('public');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        const data = await roomService.getRooms();
        setRooms(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load rooms');
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  const displayRooms = filter === 'public' ? rooms.filter(r => !r.isLocked) : rooms.filter(r => r.isLocked);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Rooms</h1>
          <p className="text-text-secondary mt-1">Join public conversations or create your own private space.</p>
        </div>
        <Button 
          variant="primary" 
          className="shrink-0 rounded-full gap-2 shadow-lg shadow-brand-primary/20"
          onClick={() => navigate('/rooms/create')}
        >
          <Plus className="w-5 h-5" />
          Create Room
        </Button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search rooms..." 
            className="w-full bg-surface border border-[rgba(255,255,255,0.08)] rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
          />
        </div>
        <div className="flex bg-surface border border-[rgba(255,255,255,0.08)] rounded-full p-1">
          <button 
            onClick={() => setFilter('public')} 
            className={`px-4 py-1 text-sm font-medium rounded-full transition-colors ${filter === 'public' ? 'bg-brand-primary/10 text-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Public
          </button>
          <button 
            onClick={() => setFilter('private')} 
            className={`px-4 py-1 text-sm font-medium rounded-full transition-colors ${filter === 'private' ? 'bg-brand-primary/10 text-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Private
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-12 text-danger-text gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : displayRooms.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          No rooms found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayRooms.map((room, idx) => {
            const name = room.settings?.name || 'Unnamed Room';
            const topic = room.settings?.topic || 'General';
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-surface hover:bg-surface-hover border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] rounded-2xl p-5 cursor-pointer transition-all"
                onClick={() => navigate(`/rooms/${room.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="px-2 py-1 bg-[rgba(255,255,255,0.05)] rounded text-xs font-medium text-text-secondary flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {topic}
                  </div>
                  {room.isLocked && <Lock className="w-4 h-4 text-text-tertiary" />}
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-brand-primary transition-colors">{name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-text-tertiary">
                    <Users className="w-4 h-4" />
                    <span>Max {room.maxParticipants}</span>
                  </div>
                  <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Join
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
