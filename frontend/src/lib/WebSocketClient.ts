type EventHandler = (data: any) => void;

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private handlers: Map<string, Set<EventHandler>> = new Map();
    private reconnectAttempts = 0;
    
    constructor(url: string) {
        this.url = url;
    }

    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {

            this.reconnectAttempts = 0;
            this.emit('system:connected', null);
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type) {
                    this.emit(message.type, message.payload);
                }
            } catch (e) {
                console.error('Failed to parse WebSocket message', e);
            }
        };

        this.ws.onclose = () => {

            this.handleReconnect();
        };
    }

    private handleReconnect() {
        if (this.reconnectAttempts < 5) {
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000));
        }
    }

    on(event: string, handler: EventHandler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event)!.add(handler);
    }

    off(event: string, handler: EventHandler) {
        if (this.handlers.has(event)) {
            this.handlers.get(event)!.delete(handler);
        }
    }

    private emit(event: string, data: any) {
        const eventHandlers = this.handlers.get(event);
        if (eventHandlers) {
            eventHandlers.forEach(handler => handler(data));
        }
    }

    send(type: string, payload: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        } else {
            console.warn('Cannot send message, WebSocket is not open');
        }
    }
}

export const wsClient = new WebSocketClient(
        import.meta.env.VITE_WS_URL
);
