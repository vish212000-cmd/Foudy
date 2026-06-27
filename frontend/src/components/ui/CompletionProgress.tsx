import { cn } from '../../lib/utils';
import { Text } from './Text';

interface CompletionProgressProps {
    score: number;
    threshold?: number;
    className?: string;
}

export function CompletionProgress({ score, threshold = 70, className }: CompletionProgressProps) {
    const isReady = score >= threshold;
    const progressColor = isReady ? 'bg-success' : 'bg-brand-primary';

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="flex items-center justify-between">
                <Text variant="caption" className="font-medium text-text-primary">
                    Profile Completion
                </Text>
                <Text variant="caption" className={cn("font-bold", isReady ? "text-success" : "text-brand-primary")}>
                    {score}%
                </Text>
            </div>
            
            <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden">
                <div 
                    className={cn("h-full transition-all duration-500 ease-out", progressColor)} 
                    style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                    role="progressbar"
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
            
            {!isReady ? (
                <Text variant="caption" className="text-text-secondary text-xs">
                    You need at least {threshold}% to enter matchmaking.
                </Text>
            ) : (
                <Text variant="caption" className="text-success text-xs font-medium">
                    You are ready for matchmaking!
                </Text>
            )}
        </div>
    );
}
