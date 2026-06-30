import { useEffect, useState, useRef } from 'react';
import { Search, Edit, MessageSquare, Phone, Video, MoreVertical, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { roomService } from '../services/RoomService';
import { ChatService } from '../services/ChatService';
import { useChatStore } from '../store/chat';
import type { RoomMetadata } from '../types/room';

export function Chat() {
  const [rooms, setRooms] = useState<RoomMetadata[]>([]);
  const [activeRoom, setActiveRoom] = useState<RoomMetadata | null>(null);
  const [inputText, setInputText] = useState("");
  const { messages, isPeerTyping, clearChat, addMessage } = useChatStore();
  const chatService = useRef(new ChatService());

  useEffect(() => {
    roomService.getRooms().then(setRooms).catch(console.error);
  }, []);

  useEffect(() => {
    if (activeRoom) {
      clearChat();
      ChatService.getMessages(activeRoom.id)
        .then(data => {
            // Depending on API response format (array or { messages: [] })
            const msgs = Array.isArray(data) ? data : data.messages || [];
            msgs.forEach((msg: any) => addMessage({
                id: msg.id || msg.correlationId,
                content: msg.content,
                senderId: msg.senderId || msg.sender_id,
                timestamp: msg.timestamp || new Date(msg.created_at).getTime(),
                state: 'DELIVERED'
            }));
        })
        .catch(console.error);
    }
  }, [activeRoom, clearChat, addMessage]);

  const handleSend = () => {
    if (inputText.trim() && activeRoom) {
      // NOTE: ChatService relies on matchId in SignalingStore. 
      // This assumes the backend treats matchId / roomId interchangeably.
      chatService.current.sendMessage(inputText);
      setInputText("");
    }
  };

  return (
    <div className="flex h-screen bg-canvas overflow-hidden pb-16 md:pb-0">
      {/* Sidebar (List) */}
      <div className="w-full md:w-80 flex flex-col border-r border-[rgba(255,255,255,0.08)] bg-surface">
        <div className="p-4 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Messages</h1>
            <button className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] text-text-secondary">
              <Edit className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
          {rooms.map((room) => {
            const roomName = room.settings?.name || 'Room ' + room.id.substring(0, 4);
            return (
            <div 
              key={room.id}
              onClick={() => setActiveRoom(room)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeRoom?.id === room.id ? 'bg-[rgba(255,255,255,0.05)]' : 'hover:bg-[rgba(255,255,255,0.03)]'}`}
            >
              <div className="relative">
                <Avatar className="w-12 h-12 border border-[rgba(255,255,255,0.1)]">
                  <AvatarFallback>{roomName.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="text-sm font-semibold text-text-primary truncate">{roomName}</h4>
                </div>
                <p className="text-sm truncate text-text-secondary">Click to open</p>
              </div>
            </div>
          )})}
          {rooms.length === 0 && (
            <div className="p-4 text-center text-text-tertiary">No recent chats</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${activeRoom ? 'flex' : 'hidden'} md:flex flex-col flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] relative`}>
        <div className="absolute inset-0 bg-canvas/95 z-0"></div>
        
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="relative z-10 p-4 border-b border-[rgba(255,255,255,0.08)] bg-surface/80 backdrop-blur-md flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <Avatar className="w-10 h-10 border border-[rgba(255,255,255,0.1)]">
                    <AvatarFallback>{(activeRoom.settings?.name || 'R').charAt(0)}</AvatarFallback>
                 </Avatar>
                 <div>
                   <h3 className="font-semibold text-text-primary">{activeRoom.settings?.name || 'Room ' + activeRoom.id.substring(0, 4)}</h3>
                   <span className="text-xs text-text-secondary flex items-center gap-1">
                     {activeRoom.isLocked ? 'Private Room' : 'Public Room'}
                   </span>
                 </div>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                 <button className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] hover:text-text-primary transition-colors"><Phone className="w-5 h-5" /></button>
                 <button className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] hover:text-text-primary transition-colors"><Video className="w-5 h-5" /></button>
                 <button className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] hover:text-text-primary transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="relative z-10 flex-1 p-6 overflow-y-auto flex flex-col justify-end space-y-4">
               {messages.length === 0 ? (
                 <div className="text-center text-text-tertiary mb-auto mt-auto flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-4 border border-[rgba(255,255,255,0.05)]">
                       <MessageSquare className="w-8 h-8 opacity-20" />
                    </div>
                    <p>No messages yet.</p>
                 </div>
               ) : (
                 <div className="flex flex-col gap-3 mt-auto">
                   {messages.map(msg => (
                     <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.senderId === 'me' ? 'bg-brand-primary text-white rounded-br-sm' : 'bg-surface border border-[rgba(255,255,255,0.05)] text-text-primary rounded-bl-sm'}`}>
                         {msg.content}
                       </div>
                     </div>
                   ))}
                   {isPeerTyping && (
                     <div className="flex justify-start">
                       <div className="px-4 py-2 rounded-2xl bg-surface border border-[rgba(255,255,255,0.05)] text-text-tertiary rounded-bl-sm text-sm">
                         Typing...
                       </div>
                     </div>
                   )}
                 </div>
               )}
            </div>

            {/* Chat Input */}
            <div className="relative z-10 p-4 bg-surface border-t border-[rgba(255,255,255,0.08)]">
               <div className="flex items-center gap-3">
                  <button className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] text-text-tertiary hover:text-text-primary transition-colors">
                     <Plus className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..." 
                    className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
               </div>
            </div>
          </>
        ) : (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-text-tertiary">
            <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
