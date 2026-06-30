import type { FC } from 'react';
import { Card } from '../components/ui/Card';

export const Privacy: FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <Card className="p-8 space-y-6 text-[var(--foudy-text-primary)]">
        <h1 className="text-3xl font-bold font-display tracking-tight text-[var(--foudy-text-primary)] mb-8">
          Privacy Policy
        </h1>
        
        <p className="text-sm text-[var(--foudy-text-secondary)]">
          Last Updated: June 30, 2026
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display">1. Information We Collect</h2>
          <p className="text-[var(--foudy-text-secondary)]">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[var(--foudy-text-secondary)] pl-4">
            <li>Account information (email, display name).</li>
            <li>Usage data (connection logs, interaction metrics).</li>
            <li>Device and network information required for WebRTC connections.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display">2. How We Use Your Information</h2>
          <p className="text-[var(--foudy-text-secondary)]">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[var(--foudy-text-secondary)] pl-4">
            <li>Provide, maintain, and improve our matchmaking services.</li>
            <li>Facilitate real-time peer-to-peer connections.</li>
            <li>Enforce our Terms of Service and prevent abuse.</li>
            <li>Analyze platform performance and usage trends.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display">3. WebRTC and Media</h2>
          <p className="text-[var(--foudy-text-secondary)]">
            FOUDY utilizes WebRTC for audio and video communication. Media streams are transmitted peer-to-peer where possible and are encrypted in transit. We do not record or store your audio or video streams on our servers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display">4. Data Sharing</h2>
          <p className="text-[var(--foudy-text-secondary)]">
            We do not sell your personal information. We may share information with trusted third-party service providers who assist us in operating our platform (e.g., cloud hosting, TURN servers).
          </p>
        </section>
      </Card>
    </div>
  );
};
