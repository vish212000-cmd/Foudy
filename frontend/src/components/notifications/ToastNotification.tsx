import React, { useEffect, useState } from 'react';
import type { AppNotification } from '../../store/notifications';

export const ToastNotification: React.FC = () => {
    const [toast, setToast] = useState<AppNotification | null>(null);

    useEffect(() => {
        const handleNewToast = (e: Event) => {
            const customEvent = e as CustomEvent<AppNotification>;
            setToast(customEvent.detail);
            
            // Auto hide after 4 seconds
            setTimeout(() => {
                setToast(null);
            }, 4000);
        };

        window.addEventListener('new_toast', handleNewToast);
        return () => window.removeEventListener('new_toast', handleNewToast);
    }, []);

    if (!toast) return null;

    return (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 max-w-sm w-full animate-slide-in">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-bold text-white text-sm">{toast.type.replace('_', ' ')}</h4>
                        <p className="text-gray-300 text-sm mt-1">{toast.content}</p>
                    </div>
                    <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white pointer-events-auto">
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
};
