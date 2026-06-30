import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const CookieConsent: FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('foudy_cookie_consent');
    if (!hasConsented) {
      // Delay slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  const handleAccept = () => {
    localStorage.setItem('foudy_cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] animate-fade-in-up">
      <Card className="p-4 border-l-4 border-l-primary/80">
        <div className="space-y-3">
          <p className="text-sm text-[var(--foudy-text-secondary)]">
            We use cookies to improve your experience, remember your preferences, and secure our WebRTC connections. By clicking "Accept", you consent to our use of cookies.
          </p>
          <div className="flex gap-2 justify-end">
            <a href="/privacy" className="text-xs self-center mr-auto text-[var(--foudy-text-tertiary)] hover:text-[var(--foudy-text-secondary)] transition-colors">
              Privacy Policy
            </a>
            <Button size="sm" onClick={handleAccept}>
              Accept
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
