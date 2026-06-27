import React, { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/auth';
import { useSocketStore } from '../store/socket';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/realtime/';
const HEARTBEAT_INTERVAL = 15000;
const HEARTBEAT_TIMEOUT = 5000;

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, accessToken } = useAuthStore();
    const { setStatus, setLastEvent, setSendMessage } = useSocketStore();
    
    const ws = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    
    const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);
    const heartbeatTimeoutTimer = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!user || !accessToken) return;
        
        setStatus(reconnectAttempts.current > 0 ? 'reconnecting' : 'connecting');
        
        const url = `${WS_URL}?token=${accessToken}`;
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            setStatus('connected');
            reconnectAttempts.current = 0;
            startHeartbeat();

            // Attempt session recovery
            ws.current?.send(JSON.stringify({ event: 'session.resume' }));
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.event === 'heartbeat.ack') {
                    if (heartbeatTimeoutTimer.current) {
                        clearTimeout(heartbeatTimeoutTimer.current);
                    }
                } else {
                    setLastEvent(data.event, data.payload);
                }
            } catch (err) {
                console.error("WebSocket msg parse error:", err);
            }
        };

        ws.current.onclose = () => {
            cleanupTimers();
            
            if (reconnectAttempts.current < maxReconnectAttempts) {
                setStatus('reconnecting');
                const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
                setTimeout(() => {
                    reconnectAttempts.current += 1;
                    connect();
                }, delay);
            } else {
                setStatus('offline');
            }
        };

        ws.current.onerror = (err) => {
            console.error("WebSocket Error:", err);
            ws.current?.close();
        };

    }, [user, accessToken, setStatus, setLastEvent]);

    const startHeartbeat = () => {
        cleanupTimers();
        heartbeatTimer.current = setInterval(() => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ event: 'heartbeat' }));
                
                heartbeatTimeoutTimer.current = setTimeout(() => {
                    // Missed heartbeat ack
                    ws.current?.close();
                }, HEARTBEAT_TIMEOUT);
            }
        }, HEARTBEAT_INTERVAL);
    };

    const cleanupTimers = () => {
        if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
        if (heartbeatTimeoutTimer.current) clearTimeout(heartbeatTimeoutTimer.current);
    };

    useEffect(() => {
        setSendMessage((event, payload) => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ event, payload }));
            }
        });
    }, [setSendMessage]);

    useEffect(() => {
        connect();
        
        return () => {
            cleanupTimers();
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [connect]);

    return <>{children}</>;
};
