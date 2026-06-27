import React, { useEffect, useState } from 'react';
import { ModerationService } from '../services/ModerationService';
import type { BlockedUser } from '../types/moderation';
import { ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BlockedUsers: React.FC = () => {
    const [blocks, setBlocks] = useState<BlockedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadBlocks();
    }, []);

    const loadBlocks = async () => {
        try {
            const data = await ModerationService.getBlockedUsers();
            setBlocks(data);
        } catch {
            setError('Failed to load blocked users.');
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (id: number) => {
        try {
            await ModerationService.unblockUser(id);
            setBlocks(blocks.filter(b => b.id !== id));
        } catch {
            alert('Failed to unblock user.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <div className="max-w-2xl mx-auto mt-10">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/home" className="p-2 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ShieldAlert className="text-red-500" /> Safety Center
                    </h1>
                </div>

                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl">
                    <h2 className="text-xl font-semibold mb-4">Blocked Users</h2>
                    
                    {error && <div className="text-red-400 mb-4">{error}</div>}
                    
                    {loading ? (
                        <div className="animate-pulse flex flex-col gap-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="h-16 bg-gray-800 rounded-xl w-full" />
                            ))}
                        </div>
                    ) : blocks.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center">
                            <ShieldCheck size={48} className="text-green-500 mb-4 opacity-50" />
                            <p className="text-gray-400 text-lg">You haven't blocked anyone.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {blocks.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                    <div>
                                        <p className="font-medium text-lg">User #{user.id}</p>
                                        <p className="text-sm text-gray-400">Blocked on {new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleUnblock(user.id)}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Unblock
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
