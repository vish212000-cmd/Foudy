export type RoomState = 
  | 'CREATED' 
  | 'WAITING' 
  | 'ACTIVE' 
  | 'LOCKED' 
  | 'FULL' 
  | 'CLOSING' 
  | 'CLOSED' 
  | 'DESTROYED';

export type ParticipantState = 
  | 'INVITED' 
  | 'JOINING' 
  | 'WAITING' 
  | 'ACTIVE' 
  | 'LEFT' 
  | 'REMOVED' 
  | 'DISCONNECTED' 
  | 'RECONNECTING';

export type ParticipantRole = 'HOST' | 'MEMBER';

export interface RoomParticipant {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  role: ParticipantRole;
  state: ParticipantState;
  joinedAt: string;
}

export interface RoomMetadata {
  id: string;
  hostId: string;
  state: RoomState;
  maxParticipants: number;
  isLocked: boolean;
  settings: Record<string, any>;
  createdAt: string;
}

export interface RoomInvite {
  code: string;
  roomId: string;
  expiresAt: string;
}
