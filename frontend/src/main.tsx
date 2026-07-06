import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './providers/ThemeProvider.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Analytics } from '@vercel/analytics/react'

declare global {
  interface Window {
    __APP_VERSION__: string | object;
  }
}

declare const __GIT_COMMIT__: string | undefined;
declare const __BUILD_DATE__: string | undefined;
declare const __BUILD_NUMBER__: string | undefined;

// @ts-ignore
window.__APP_VERSION__ = {
  commit: typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : 'unknown',
  build_date: typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : 'unknown',
  build_number: typeof __BUILD_NUMBER__ !== 'undefined' ? __BUILD_NUMBER__ : 'unknown'
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder'}>
      <ThemeProvider>
        <App />
        <Analytics />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
