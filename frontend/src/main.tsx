import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './providers/ThemeProvider.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { Analytics } from '@vercel/analytics/react'

declare global {
  interface Window {
    __APP_VERSION__: string;
  }
}

// @ts-ignore
window.__APP_VERSION__ = typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : 'unknown';

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
