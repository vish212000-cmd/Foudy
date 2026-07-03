import { v4 as uuidv4 } from "uuid";
import { useSocketStore } from "../store/socket";
import { useSignalingStore } from "../store/signaling";
import { useChatStore } from "../store/chat";
import api from "./api";

export class ChatService {
    constructor() {}

    static async getMessages(roomId: string) {
        const res = await api.get(`/chat/rooms/${roomId}/messages/`);
        return res.data.results !== undefined ? res.data.results : res.data;
    }

    private sendWithAck(event: string, payload: any) {
        const { status, sendMessage } = useSocketStore.getState();
        if (status !== 'connected') {
            console.error("ChatService: WebSocket is not open");
            return null;
        }

        const correlationId = uuidv4();
        const { matchId } = useSignalingStore.getState();

        if (!matchId) {
            console.error("ChatService: No matchId set");
            return null;
        }

        const fullPayload = {
            ...payload,
            version: "1.0",
            correlationId,
            matchId
        };

        sendMessage(event, fullPayload);
        return correlationId;
    }

    public sendMessage(content: string) {
        const correlationId = this.sendWithAck('chat.message', { content });
        if (correlationId) {
            // Optimistically add to store
            useChatStore.getState().addMessage({
                id: correlationId,
                content,
                senderId: 'me', // Will be determined properly on receive, but 'me' is fine for optimistic
                timestamp: Date.now(),
                state: 'SENDING'
            });
        }
    }

    public sendTyping() {
        this.sendWithAck('chat.typing', {});
    }

    public sendStopTyping() {
        this.sendWithAck('chat.typing_stop', {});
    }
    
    public sendDelivered(correlationId: string) {
        this.sendWithAck('chat.delivered', { messageId: correlationId });
    }
}
