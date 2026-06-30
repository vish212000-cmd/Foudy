import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Video, Mic, MessageSquare, Plus, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import { useAuthStore } from "../store/auth";
import { useSocketStore } from "../store/socket";
import { MatchingService } from "../services/matching";

type ChatMode = "video" | "audio" | "text";

interface ModeOption {
  id: ChatMode;
  icon: React.ReactNode;
  label: string;
  caption: string;
  color: string;
}

const modes: ModeOption[] = [
  {
    id: "video",
    icon: <Video className="h-6 w-6" />,
    label: "Video Chat",
    caption: "Face to face connection",
    color: "bg-brand-primary",
  },
  {
    id: "audio",
    icon: <Mic className="h-6 w-6" />,
    label: "Audio Chat",
    caption: "Talk without cameras",
    color: "bg-success-text",
  },
  {
    id: "text",
    icon: <MessageSquare className="h-6 w-6" />,
    label: "Text Chat",
    caption: "Quiet and relaxed",
    color: "bg-blue-500",
  },
];

export default function RandomMatch() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [selectedMode, setSelectedMode] = useState<ChatMode>("video");
  const [interests, setInterests] = useState<string[]>(user?.profile?.interests?.length ? user.profile.interests : ["Gaming", "Music"]);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lastEvent } = useSocketStore();

  useEffect(() => {
    // Matchmaking Gate
    const score = user?.profile?.completion_score || 0;
    if (score < 70) {
      navigate('/setup', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isJoining && lastEvent?.event === 'match.found') {
      navigate('/match-found', { state: { matchId: lastEvent.payload.matchId || lastEvent.payload.matched_with, partner: lastEvent.payload.partner } });
    }
  }, [lastEvent, isJoining, navigate]);

  const handleAddInterest = () => {
    const newInterest = window.prompt("Add an interest:");
    if (newInterest && newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests((prev) => [...prev, newInterest.trim()]);
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(prev => prev.filter(i => i !== interest));
  }

  const handleStartMatching = async () => {
    setIsJoining(true);
    setError(null);
    try {
        await MatchingService.joinQueue();
        // Now we just wait for match.found via the socket
    } catch (err: any) {
        setError(err.response?.data?.error || "Failed to join queue.");
        setIsJoining(false);
    }
  };

  // If we're actively joining, show the full-screen radar pulse
  if (isJoining && !error) {
    return (
      <div className="fixed inset-0 z-50 bg-canvas flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Radar pulses */}
          <motion.div
            animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute w-32 h-32 rounded-full border-2 border-brand-primary"
          />
          <motion.div
            animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.6 }}
            className="absolute w-32 h-32 rounded-full border-2 border-brand-primary"
          />
          <motion.div
            animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.2 }}
            className="absolute w-32 h-32 rounded-full border-2 border-brand-primary"
          />
          {/* Center icon */}
          <div className="relative z-10 w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/50">
             {selectedMode === 'video' && <Video className="w-10 h-10 text-white" />}
             {selectedMode === 'audio' && <Mic className="w-10 h-10 text-white" />}
             {selectedMode === 'text' && <MessageSquare className="w-10 h-10 text-white" />}
          </div>
        </div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-2xl font-bold text-text-primary tracking-tight"
        >
          Connecting to global network...
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-text-secondary mt-2"
        >
          Finding the best match based on your interests.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <Button
        variant="ghost"
        size="icon"
        className="mb-8 rounded-full bg-surface hover:bg-surface-hover border border-border-default shadow-sm"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-10"
      >
        <div className="text-center max-w-xl mx-auto relative">
          <div className="inline-flex items-center justify-center p-3 bg-brand-primary/10 rounded-2xl mb-4">
            <Sparkles className="w-6 h-6 text-brand-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight mb-4">
            Start a <span className="text-brand-primary">Random Match</span>
          </h1>
          <p className="text-lg text-text-secondary">
            Choose how you want to connect and we'll pair you with someone instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={cn(
                  "relative flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-200 overflow-hidden",
                  isSelected 
                    ? "border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/10" 
                    : "border-border-default bg-surface hover:border-text-tertiary"
                )}
              >
                {/* Active Indicator Background Glow */}
                {isSelected && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-brand-primary/20 blur-xl rounded-full" />
                )}

                <div className={cn(
                  "p-4 rounded-full mb-4 transition-colors",
                  isSelected ? `${mode.color} text-white shadow-md` : "bg-surface-hover text-text-secondary"
                )}>
                  {mode.icon}
                </div>
                
                <h3 className={cn("text-lg font-bold mb-1", isSelected ? "text-text-primary" : "text-text-secondary")}>
                  {mode.label}
                </h3>
                <p className="text-sm text-text-tertiary">
                  {mode.caption}
                </p>

                {isSelected && (
                  <motion.div layoutId="match-mode-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-primary rounded-t-full" />
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="bg-surface border border-border-default rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-text-primary">Matching Interests</h3>
              <p className="text-sm text-text-secondary">We'll try to find someone who likes these topics.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleAddInterest} className="shrink-0 rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Add Interest
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {interests.map((interest) => (
                <motion.div
                  key={interest}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-hover border border-border-strong text-text-primary hover:bg-danger-bg/20 hover:border-danger-bg hover:text-danger-text transition-colors group"
                  >
                    <span>{interest}</span>
                    <span className="opacity-0 group-hover:opacity-100 font-bold ml-1 transition-opacity">×</span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {interests.length === 0 && (
              <p className="text-sm text-text-tertiary italic">No interests added. You'll be matched purely at random.</p>
            )}
          </div>
        </div>

        {error && (
            <div className="p-4 bg-danger-bg/20 border border-danger-bg rounded-xl">
                <p className="text-danger-text text-center font-medium">{error}</p>
            </div>
        )}

        <div className="flex justify-center pt-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full md:w-auto md:min-w-[300px] text-lg font-bold shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/40 rounded-full group"
            onClick={handleStartMatching}
          >
            Start Matching
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

      </motion.div>
    </div>
  );
}
