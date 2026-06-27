import { useNavigate, useLocation } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Text } from '../components/ui/Text';
import { Heading } from '../components/ui/Heading';

export default function MatchFound() {
    const navigate = useNavigate();
    const location = useLocation();
    const matchId = location.state?.matchId;

    return (
        <div className="dark min-h-screen bg-canvas font-sans flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 flex flex-col items-center text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <Users className="h-10 w-10 text-primary" />
                </div>
                
                <div className="space-y-2">
                    <Heading variant="h2" className="text-text-primary text-center">
                        Match Found!
                    </Heading>
                    <Text variant="body" className="text-muted-foreground">
                        You have been matched with User #{matchId}.
                    </Text>
                    <Text variant="caption" className="text-muted-foreground mt-4 block">
                        Media streams disabled for this milestone.
                    </Text>
                </div>

                <div className="pt-6 w-full">
                    <Button 
                        variant="secondary" 
                        size="lg" 
                        className="w-full gap-2 border-border"
                        onClick={() => navigate('/random-match')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Queue
                    </Button>
                </div>
            </div>
        </div>
    );
}
