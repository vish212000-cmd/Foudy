import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Video, Mic, MessageSquare } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Heading } from "../components/ui/Heading";
import { Text } from "../components/ui/Text";
import { cn } from "../lib/utils";
import { useAuthStore } from "../store/auth";
import { MatchingService } from "../services/matching";
import { Loader2 } from "lucide-react";

type ChatMode = "video" | "audio" | "text";

interface ModeOption {
  id: ChatMode;
  icon: React.ReactNode;
  label: string;
  caption: string;
}

const modes: ModeOption[] = [
  {
    id: "video",
    icon: <Video className="h-8 w-8 text-brand-primary" aria-hidden="true" />,
    label: "Video Chat",
    caption: "See each other face to face",
  },
  {
    id: "audio",
    icon: <Mic className="h-8 w-8 text-brand-primary" aria-hidden="true" />,
    label: "Audio Chat",
    caption: "Talk without video",
  },
  {
    id: "text",
    icon: <MessageSquare className="h-8 w-8 text-brand-primary" aria-hidden="true" />,
    label: "Text Chat",
    caption: "Chat via messages",
  },
];

const defaultInterests = ["Gaming", "Music", "Tech", "Art"];

export default function RandomMatch() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [selectedMode, setSelectedMode] = useState<ChatMode>("video");
  const [interests, setInterests] = useState<string[]>(defaultInterests);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Matchmaking Gate
    const score = user?.profile?.completion_score || 0;
    if (score < 70) {
      navigate('/setup', { replace: true });
    }
  }, [user, navigate]);

  const handleAddInterest = () => {
    const newInterest = window.prompt("Add an interest:");
    if (newInterest && newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests((prev) => [...prev, newInterest.trim()]);
    }
  };

  const handleStartMatching = async () => {
    setIsJoining(true);
    setError(null);
    try {
        await MatchingService.joinQueue();
        navigate('/searching');
    } catch (err: any) {
        setError(err.response?.data?.error || "Failed to join queue.");
    } finally {
        setIsJoining(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-canvas font-sans">
      {/* Back button */}
      <div className="px-4 pt-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Go back"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      {/* Main content */}
      <main
        className="max-w-md mx-auto py-10 px-4"
        role="main"
        aria-labelledby="find-match-heading"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <Heading variant="h1" id="find-match-heading" className="text-text-primary mb-2">
            Find Your Match
          </Heading>
          <Text variant="body" className="text-text-secondary">
            Choose how you want to connect
          </Text>
        </div>

        {/* Mode selection */}
        <div
          className="mb-8"
          role="radiogroup"
          aria-label="Select chat mode"
        >
          <div className="flex flex-col gap-3">
            {modes.map((mode) => {
              const isSelected = selectedMode === mode.id;
              return (
                <div
                  key={mode.id}
                  role="radio"
                  aria-checked={isSelected}
                  aria-pressed={isSelected}
                  tabIndex={0}
                  onClick={() => setSelectedMode(mode.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedMode(mode.id);
                    }
                  }}
                  className={cn(
                    "rounded-xl border border-border-default bg-surface p-5 cursor-pointer",
                    "hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                    isSelected && "ring-2 ring-brand-primary border-brand-primary bg-brand-primary/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex-shrink-0 p-2 rounded-lg",
                        isSelected ? "bg-brand-primary/10" : "bg-surface-hover"
                      )}
                    >
                      {mode.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-text-primary leading-tight">
                        {mode.label}
                      </p>
                      <p className="text-sm text-text-secondary mt-0.5">
                        {mode.caption}
                      </p>
                    </div>
                    {/* Selection indicator */}
                    <div
                      aria-hidden="true"
                      className={cn(
                        "flex-shrink-0 h-5 w-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
                        isSelected
                          ? "border-brand-primary bg-brand-primary"
                          : "border-border-strong bg-transparent"
                      )}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-text-inverse" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interests */}
        <section className="mb-8" aria-labelledby="interests-heading">
          <Heading
            variant="h4"
            id="interests-heading"
            className="text-text-primary mb-3"
          >
            Your Interests
          </Heading>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Selected interests"
          >
            {interests.map((interest) => (
              <Button
                key={interest}
                type="button"
                variant="secondary"
                size="sm"
                aria-label={`Interest: ${interest}`}
                className="rounded-full"
              >
                {interest}
              </Button>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddInterest}
              aria-label="Add new interest"
              className="rounded-full border-dashed text-text-tertiary"
            >
              + Add
            </Button>
          </div>
        </section>

        {/* CTA */}
        {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <Text variant="caption" className="text-destructive text-center block">{error}</Text>
            </div>
        )}
        <Button
          variant="primary"
          size="lg"
          className="w-full gap-2"
          onClick={handleStartMatching}
          disabled={isJoining}
          aria-label={`Start matching in ${selectedMode} mode`}
        >
          {isJoining ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <>Start Matching <ArrowRight className="h-5 w-5" aria-hidden="true" /></>
          )}
        </Button>

        {/* Fine print */}
        <Text variant="caption" className="text-center text-text-tertiary mt-4">
          You will be matched with someone based on your interests
        </Text>
      </main>
    </div>
  );
}
