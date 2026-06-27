export type SignalingState = 
  | 'CREATED' 
  | 'NEGOTIATING' 
  | 'CONNECTED' 
  | 'RENEGOTIATING' 
  | 'DISCONNECTED' 
  | 'FAILED' 
  | 'CLOSED';

export interface BaseSignalingMessage {
  matchId: string;
  correlationId: string;
  version: string;
  targetUserId?: string; // primarily for the initial OFFER
  roomId?: string; // added for group calls
}

export interface OfferMessage extends BaseSignalingMessage {
  sdp: RTCSessionDescriptionInit;
}

export interface AnswerMessage extends BaseSignalingMessage {
  sdp: RTCSessionDescriptionInit;
}

export interface IceCandidateMessage extends BaseSignalingMessage {
  candidate: RTCIceCandidateInit;
}

export interface DisconnectMessage extends BaseSignalingMessage {
  reason?: string;
}

export interface ResumeMessage extends BaseSignalingMessage {
  lastProcessedCorrelationId?: string;
}

import type { MediaHardwareState } from './media';

export interface ErrorMessage extends BaseSignalingMessage {
  code: number;
  message: string;
}

export interface MediaUpdateMessage extends BaseSignalingMessage {
  cameraState?: MediaHardwareState;
  microphoneState?: MediaHardwareState;
  isScreenSharing?: boolean;
}

export interface AckMessage {
  status: 'ok';
  correlationId: string;
  duplicate?: boolean;
}

export type SignalingPayload = 
  | OfferMessage 
  | AnswerMessage 
  | IceCandidateMessage 
  | DisconnectMessage 
  | ResumeMessage 
  | ErrorMessage
  | MediaUpdateMessage;
