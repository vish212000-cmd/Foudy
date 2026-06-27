import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { ModerationService } from '../../services/ModerationService';

interface Props {
    targetUserId: string;
    isOpen: boolean;
    onClose: () => void;
    onBlocked?: () => void; // Optional callback if we want to immediately do something UI side, though backend disconnect will handle it.
}

export const BlockDialog: React.FC<Props> = ({ targetUserId, isOpen, onClose, onBlocked }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleBlock = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            await ModerationService.blockUser(Number(targetUserId));
            if (onBlocked) onBlocked();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to block user. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <ShieldAlert className="text-red-500 w-8 h-8" />
                    </div>
                    
                    <h2 className="text-xl font-bold text-white">Block User?</h2>
                    
                    <p className="text-gray-400 text-sm">
                        Are you sure you want to block this user? They will not be able to match with you or contact you again. 
                        <strong> This will immediately end the current call.</strong>
                    </p>

                    {error && <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded-lg w-full">{error}</div>}

                    <div className="flex w-full gap-3 mt-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleBlock}
                            disabled={isSubmitting}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition-colors font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? 'Blocking...' : 'Block'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
