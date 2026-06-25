import React, { useState } from "react";
import { Video, Mic, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Heading } from "../components/ui/Heading";
import { Text } from "../components/ui/Text";
import { Badge } from "../components/ui/Badge";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { cn } from "../lib/utils";

export default function MatchFound() {
  const [revealed, setRevealed] = useState(false);

  // Trigger reveal animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="dark min-h-screen bg-canvas font-sans flex flex-col items-center justify-center px-4 py-8"
      aria-label="Match found screen"
    >
      {/* Ambient glow */}
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-brand-primary/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-brand-primary/5 blur-3xl" />
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col items-center gap-6 text-center relative z-10 w-full max-w-sm",
          "transition-all duration-700 ease-out",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        role="main"
        aria-labelledby="match-found-heading"
      >
        {/* Match found banner */}
        <div
          className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 px-4 py-1.5"
          aria-hidden="true"
        >
          <Sparkles className="h-4 w-4 text-brand-primary" />
          <span className="text-sm font-semibold text-brand-primary">Match Found</span>
          <Sparkles className="h-4 w-4 text-brand-primary" />
        </div>

        {/* Heading */}
        <div className="flex flex-col items-center gap-1">
          <Heading
            variant="h1"
            id="match-found-heading"
            className="text-text-primary flex items-center gap-2"
          >
            Match Found!
          </Heading>
          <Text variant="body" className="text-text-secondary">
            You matched with
          </Text>
        </div>

        {/* Avatar and profile */}
        <div className="flex flex-col items-center gap-4">
          {/* Avatar with ring */}
          <div className="relative">
            {/* Animated ring */}
            <div
              aria-hidden="true"
              className="absolute -inset-2 rounded-full border-2 border-brand-primary animate-pulse opacity-60"
            />
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-full border border-brand-primary/30 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
            <Avatar
              className="h-24 w-24 border-2 border-brand-primary shadow-lg shadow-brand-primary/20"
              aria-label="Match avatar for alex_dev"
            >
              <AvatarFallback className="bg-brand-primary/20 text-brand-primary text-2xl font-bold">
                A
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div
              aria-hidden="true"
              className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-success-text border-2 border-canvas"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col items-center gap-1">
            <Heading variant="h2" className="text-text-primary">
              alex_dev
            </Heading>
            <Text variant="caption" className="text-text-tertiary">
              Online now
            </Text>
          </div>
        </div>

        {/* Interest tags */}
        <div
          className="flex flex-wrap justify-center gap-2"
          aria-label="Match interests"
          role="group"
        >
          <Badge variant="secondary" aria-label="Interest: Gaming">Gaming</Badge>
          <Badge variant="secondary" aria-label="Interest: Tech">Tech</Badge>
          <Badge variant="secondary" aria-label="Interest: Music">Music</Badge>
        </div>

        {/* Match percentage */}
        <div className="flex flex-col items-center gap-1">
          <p
            className="text-3xl font-bold text-brand-primary"
            aria-label="94 percent match"
          >
            94% Match
          </p>
          <div
            className="w-full max-w-xs h-1.5 rounded-full bg-surface-active overflow-hidden"
            role="progressbar"
            aria-valuenow={94}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Match compatibility: 94%"
          >
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-1000 ease-out"
              style={{ width: revealed ? "94%" : "0%" }}
            />
          </div>
          <Text variant="caption" className="text-text-tertiary">
            Based on shared interests
          </Text>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-border-subtle" aria-hidden="true" />

        {/* Action buttons */}
        <div
          className="flex flex-col gap-3 w-full max-w-xs"
          aria-label="Choose how to connect"
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full gap-2"
            aria-label="Start video chat with alex_dev"
          >
            <Video className="h-5 w-5" aria-hidden="true" />
            Start Video Chat
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full gap-2"
            aria-label="Start audio call with alex_dev"
          >
            <Mic className="h-5 w-5" aria-hidden="true" />
            Start Audio Call
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full gap-2"
            aria-label="Text chat only with alex_dev"
          >
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
            Text Chat Only
          </Button>
        </div>

        {/* Skip */}
        <button
          type="button"
          className="text-sm text-text-tertiary hover:text-text-secondary transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 focus-visible:ring-offset-canvas rounded-sm px-2 py-1"
          aria-label="Skip this match and find another"
        >
          Skip this match
        </button>
      </div>
    </div>
  );
}
