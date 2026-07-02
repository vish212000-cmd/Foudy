import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Radio } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Heading } from "../components/ui/Heading";
import { Text } from "../components/ui/Text";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { useSocketStore } from "../store/socket";
import { MatchingService } from "../services/matching";

export default function Searching() {
  const navigate = useNavigate();
  const { lastEvent } = useSocketStore();
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.event === 'matched') {
        navigate('/match-found', { state: { matchId: lastEvent.payload.matched_with } });
    } else if (lastEvent.event === 'queue_status' && lastEvent.payload.status === 'IDLE') {
        navigate('/match');
    }
  }, [lastEvent, navigate]);

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
        await MatchingService.leaveQueue();
        navigate(-1);
    } catch {
        navigate(-1);
    }
  };

  return (
    <div
      className="dark min-h-screen bg-canvas font-sans relative flex flex-col items-center justify-center px-4"
      aria-busy="true"
      aria-label="Searching for a match"
    >
      {/* Ambient background glow */}
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square rounded-full bg-brand-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs aspect-square rounded-full bg-brand-primary/8 blur-2xl animate-pulse" />
      </div>

      {/* Cancel button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
        aria-label="Cancel search"
        onClick={handleCancel}
        disabled={isCanceling}
      >
        {isCanceling ? "Canceling..." : "Cancel"}
      </Button>

      {/* Main centered content */}
      <div className="flex flex-col items-center gap-6 text-center relative z-10 max-w-sm w-full">

        {/* Pulsing ring with icon */}
        <div className="relative flex items-center justify-center" aria-hidden="true">
          {/* Outer ripple ring — slowest */}
          <div
            className="absolute h-64 w-64 rounded-full border border-brand-primary/20 animate-ping"
            style={{ animationDuration: "2.5s" }}
          />
          {/* Mid ripple ring */}
          <div
            className="absolute h-52 w-52 rounded-full border border-brand-primary/30 animate-ping"
            style={{ animationDuration: "2s" }}
          />
          {/* Primary pulsing circle */}
          <div className="h-48 w-48 rounded-full border-4 border-brand-primary bg-brand-primary/10 animate-pulse flex items-center justify-center shadow-lg">
            {/* Inner glow ring */}
            <div className="h-36 w-36 rounded-full border border-brand-primary/30 flex items-center justify-center">
              <Radio
                className="h-16 w-16 text-brand-primary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="flex flex-col items-center gap-2">
          <Heading variant="h2" className="text-text-primary">
            Finding your match...
          </Heading>
          <Text variant="body" className="text-text-secondary max-w-xs">
            Looking for someone who shares your interests
          </Text>
        </div>

        {/* Spinner */}
        <div aria-label="Searching in progress" role="status">
          <Spinner size="lg" />
          <span className="sr-only">Searching for a match, please wait</span>
        </div>

        {/* Estimated wait */}
        <Text variant="caption" className="text-text-tertiary">
          Estimated wait: ~30 seconds
        </Text>

        {/* Separator */}
        <div className="w-full border-t border-border-subtle" aria-hidden="true" />

        {/* Selected interests */}
        <div className="flex flex-col items-center gap-2 w-full">
          <Text
            variant="caption"
            className="text-text-tertiary uppercase tracking-wide font-medium"
          >
            Matching on
          </Text>
          <div
            className="flex flex-wrap gap-2 justify-center"
            aria-label="Selected interests for matching"
            role="group"
          >
            <Badge variant="default" aria-label="Interest: Gaming">
              Gaming
            </Badge>
            <Badge variant="default" aria-label="Interest: Tech">
              Tech
            </Badge>
          </div>
        </div>

        {/* Live region for screen readers */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          Searching for a match based on your interests. Please wait.
        </div>
      </div>
    </div>
  );
}
