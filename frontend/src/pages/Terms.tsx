import type { FC } from 'react';
import { Card } from '../components/ui/Card';

export const Terms: FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <Card className="p-8 space-y-6 text-[var(--foudy-text-primary)]">
        <h1 className="text-3xl font-bold font-display tracking-tight text-[var(--foudy-text-primary)] mb-8">
          Terms of Service
        </h1>
        
        <p className="text-sm text-[var(--foudy-text-secondary)]">
          Last Updated: June 30, 2026
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display">1. Acceptance of Terms</h2>
          <p className="text-[var(--foudy-text-secondary)]">
            By accessing and using FOUDY, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display">2. User Conduct</h2>
          <p className="text-[var(--foudy-text-secondary)]">
            FOUDY is a real-time communication platform. Users are strictly prohibited from:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[var(--foudy-text-secondary)] pl-4">
            <li>Harassing, bullying, or intimidating others.</li>
            <li>Sharing illegal, explicit, or unauthorized content.</li>
            <li>Using automated scripts to interact with the platform.</li>
            <li>Attempting to circumvent security measures or rate limits.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display">3. Account Suspension</h2>
          <p className="text-[var(--foudy-text-secondary)]">
            We reserve the right to suspend or terminate accounts that violate our terms, receive excessive reports from other users, or engage in suspicious activity.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display">4. Limitation of Liability</h2>
          <p className="text-[var(--foudy-text-secondary)]">
            FOUDY is provided "as is" without warranties of any kind. We are not responsible for the content shared by users or any damages arising from the use of our service.
          </p>
        </section>
      </Card>
    </div>
  );
};
