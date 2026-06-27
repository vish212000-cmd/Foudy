import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ModerationService } from '../../services/ModerationService';

interface Props {
    targetUserId: string;
    isOpen: boolean;
    onClose: () => void;
}

const REPORT_REASONS = [
    "Inappropriate Content",
    "Harassment or Bullying",
    "Spam or Scam",
    "Underage User",
    "Other"
];

export const ReportDialog: React.FC<Props> = ({ targetUserId, isOpen, onClose }) => {
    const [reason, setReason] = useState(REPORT_REASONS[0]);
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await ModerationService.reportUser(Number(targetUserId), { reason, details });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setDetails('');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-red-500" /> Report User
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                {success ? (
                    <div className="p-8 text-center text-green-400">
                        <p className="font-semibold text-lg">Report submitted successfully.</p>
                        <p className="text-sm text-gray-400 mt-2">Thank you for keeping our community safe.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                        {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">{error}</div>}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                            <select 
                                value={reason} 
                                onChange={e => setReason(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-blue-500"
                            >
                                {REPORT_REASONS.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Additional Details (Optional)</label>
                            <textarea 
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 resize-none"
                                placeholder="Provide more context..."
                            />
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition-colors font-medium disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
