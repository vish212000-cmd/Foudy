import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, 
  PhoneOff, MessageSquare, Settings, Sparkles, Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { useConnectionState } from '../providers/ConnectionStateProvider';
import { useSignalingStore } from '../store/signaling';
import { useCallStore } from '../store/call';

export default function MatchFound() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Partner info passed from RandomMatch via navigation state
    const matchId = location.state?.matchId;
    const partner = location.state?.partner || {
      name: "Match",
      avatar: "",
      country: "Unknown",
      interests: [],
      matchReason: "Random Match"
    };

    const { peerManager, mediaService } = useConnectionState();
    const { state: signalingState, setState: setSignalingState, setMatchContext } = useSignalingStore();
    const { callState, remoteStream } = useCallStore();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (matchId) {
            setMatchContext(matchId, partner.id || 'unknown');
            // Assuming the peer that navigates here initiates, or we can just try to create peer.
            // A more robust implementation would use a role provided by the backend.
            if (peerManager) {
                // Determine if we should initiate. For now, let's just always initiate if we're here
                // or rely on the backend to send an offer to one and not the other if we both arrive here.
                // Assuming we are initiator for simplicity, or we can just call createPeer() and let backend handle the rest.
                peerManager.createPeer(true);
            }
        }
    }, [matchId, peerManager, setMatchContext, partner.id]);

    useEffect(() => {
        const setupLocalVideo = async () => {
            if (mediaService) {
                try {
                    await mediaService.startLocalMedia();
                    mediaService.toggleCameraMute(isVideoOff);
                    mediaService.toggleMicMute(isMuted);

                    const stream = mediaService.getLocalVideoStream();
                    if (localVideoRef.current && stream) {
                        localVideoRef.current.srcObject = stream;
                    }
                } catch (e) {
                    console.error("Failed to get local media", e);
                }
            }
        };
        setupLocalVideo();
    }, [mediaService, isVideoOff, isMuted]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handleEndCall = () => {
      if (peerManager) {
          peerManager.close();
      }
      setSignalingState('DISCONNECTED');
      setTimeout(() => navigate('/home'), 1000);
    };

    if (signalingState === 'CLOSED' || signalingState === 'DISCONNECTED' || callState === 'ENDED') {
      return (
        <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-surface border border-border-default flex items-center justify-center mx-auto shadow-lg">
              <Check className="w-8 h-8 text-success-text" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Call Ended</h2>
            <p className="text-text-secondary">Returning to dashboard...</p>
          </motion.div>
        </div>
      );
    }

    const isConnecting = signalingState === 'CREATED' || signalingState === 'NEGOTIATING';
    const isConnected = signalingState === 'CONNECTED' || callState === 'IN_CALL';

    return (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col font-sans">
            
            {/* Header overlay */}
            <div className="absolute top-0 w-full p-4 md:p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
               <div className="flex items-center gap-3">
                 <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      {isConnected ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-text opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-success-text"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-warning-text"></span>
                      )}
                    </span>
                    <span className="text-sm font-medium">
                      {isConnecting ? 'Connecting...' : 'Connected'}
                    </span>
                 </div>
                 {isConnected && (
                    <div className="hidden md:flex px-3 py-1.5 rounded-full bg-brand-primary/20 backdrop-blur-md border border-brand-primary/30 items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                      <span className="text-sm font-medium text-brand-primary">{partner.matchReason || 'Match Found'}</span>
                    </div>
                 )}
               </div>
               
               <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white" onClick={() => navigate('/chat')}>
                   <MessageSquare className="w-5 h-5" />
                 </Button>
                 <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white hidden sm:flex">
                   <Settings className="w-5 h-5" />
                 </Button>
               </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 flex flex-col md:flex-row relative">
              
              {/* Partner Video (Main) */}
              <div className="flex-1 relative bg-surface overflow-hidden">
                <AnimatePresence>
                  {isConnecting ? (
                    <motion.div 
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-canvas"
                    >
                      <div className="relative">
                        <Avatar className="w-32 h-32 border-4 border-surface shadow-2xl z-10 relative">
                           <AvatarImage src={partner.avatar || ""} />
                           <AvatarFallback className="bg-brand-primary/20 text-brand-primary text-3xl">{partner.name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 rounded-full border-2 border-brand-primary animate-ping" style={{ animationDuration: '2s' }}></div>
                      </div>
                      <h2 className="mt-8 text-2xl font-bold tracking-tight">Match Found!</h2>
                      <p className="text-text-secondary mt-2">Connecting secure stream to {partner.name || 'someone'}...</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0"
                    >
                      {/* Real Video Stream */}
                      <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover" 
                      />
                      
                      {/* Partner Info Overlay */}
                      <div className="absolute bottom-6 left-6 flex items-end gap-4 z-10">
                        <div className="p-1 rounded-full bg-white/10 backdrop-blur-md">
                           <Avatar className="w-12 h-12 border border-white/20">
                             <AvatarImage src={partner.avatar || ""} />
                             <AvatarFallback>{partner.name?.[0] || '?'}</AvatarFallback>
                           </Avatar>
                        </div>
                        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                          <h3 className="font-semibold text-lg">{partner.name || 'Anonymous'}</h3>
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <span>{partner.country || 'Unknown'}</span>
                            {(partner.interests || []).length > 0 && <span>•</span>}
                            <div className="flex gap-1">
                              {(partner.interests || []).slice(0, 2).map((i: string) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-white/10 text-xs">{i}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Self Video (PiP on Desktop, stacked on Mobile) */}
              <motion.div 
                layout
                className={cn(
                  "relative bg-surface border border-white/10 overflow-hidden shadow-2xl z-20",
                  "md:absolute md:top-6 md:right-6 md:w-64 md:h-48 md:rounded-2xl",
                  "w-full h-48 md:block shrink-0"
                )}
              >
                {/* Real Self Video Stream */}
                {isVideoOff ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
                     <Avatar className="w-16 h-16 opacity-50">
                        <AvatarFallback>U</AvatarFallback>
                     </Avatar>
                  </div>
                ) : (
                  <video 
                    ref={localVideoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                )}
                
                {/* Self Controls Overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                  <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs">You</div>
                  {isMuted && (
                    <div className="bg-danger-bg/80 text-white p-1 rounded-full backdrop-blur-md">
                      <MicOff className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-full shadow-2xl">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  isMuted ? "bg-danger-bg text-white hover:bg-danger-bg/90" : "bg-white/10 hover:bg-white/20 text-white"
                )}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  isVideoOff ? "bg-danger-bg text-white hover:bg-danger-bg/90" : "bg-white/10 hover:bg-white/20 text-white"
                )}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={handleEndCall}
                className="w-16 h-12 rounded-full bg-danger-bg hover:bg-red-600 flex items-center justify-center text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
        </div>
    );
}
