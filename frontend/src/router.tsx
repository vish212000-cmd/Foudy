import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { GuestRoute } from './components/auth/GuestRoute'
import { AppLayout } from './layouts/AppLayout'
import { CallLayout } from './layouts/CallLayout'
import { Splash } from './pages/Splash'

export const router = createBrowserRouter([
  // ─── Splash / Onboarding ───────────────────────────────────────────────────
  // Keep Splash eagerly loaded for immediate initial render
  { path: '/', element: <Splash /> },
  { 
    path: '/welcome', 
    lazy: async () => ({ Component: (await import('./pages/Welcome')).Welcome }) 
  },
  {
    element: <GuestRoute />,
    children: [
      { 
        path: '/login', 
        lazy: async () => ({ Component: (await import('./pages/Login')).default }) 
      },
      { 
        path: '/register', 
        lazy: async () => ({ Component: (await import('./pages/Register')).default }) 
      },
    ]
  },

  // ─── Call / Immersive screens ──────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <CallLayout />,
        children: [
          { 
            path: '/searching', 
            lazy: async () => ({ Component: (await import('./pages/Searching')).default }) 
          },
          { 
            path: '/match-found', 
            lazy: async () => ({ Component: (await import('./pages/MatchFound')).default }) 
          },
        ],
      },
      // ─── App layout screens ───────────────────────────────────────────────────
      {
        element: <AppLayout />,
        children: [
          { 
            path: '/home', 
            lazy: async () => ({ Component: (await import('./pages/Home')).Home }) 
          },
          { 
            path: '/match', 
            lazy: async () => ({ Component: (await import('./pages/RandomMatch')).default }) 
          },
          { 
            path: '/setup', 
            lazy: async () => ({ Component: (await import('./pages/ProfileSetup')).ProfileSetup }) 
          },
          { 
            path: '/settings', 
            lazy: async () => ({ Component: (await import('./pages/Settings')).Settings }) 
          },
          { 
            path: '/profile', 
            lazy: async () => ({ Component: (await import('./pages/Profile')).Profile }) 
          },
          { 
            path: '/rooms', 
            lazy: async () => ({ Component: (await import('./pages/Rooms')).Rooms }) 
          },
          { 
            path: '/chat', 
            lazy: async () => ({ Component: (await import('./pages/Chat')).Chat }) 
          },
          { 
            path: '/blocked', 
            lazy: async () => ({ Component: (await import('./pages/BlockedUsers')).BlockedUsers }) 
          },
          // Redirect unknown routes to profile for now to avoid broken nav
          { path: '*', element: <Navigate to="/profile" replace /> }
        ],
      },
    ]
  },

  // ─── Standalone full-page screens ─────────────────────────────────────────
  { 
    path: '/terms', 
    lazy: async () => ({ Component: (await import('./pages/Terms')).Terms }) 
  },
  { 
    path: '/privacy', 
    lazy: async () => ({ Component: (await import('./pages/Privacy')).Privacy }) 
  },
  { 
    path: '/no-internet', 
    lazy: async () => ({ Component: (await import('./pages/NoInternet')).NoInternet }) 
  },
  { 
    path: '/server-error', 
    lazy: async () => ({ Component: (await import('./pages/ServerError')).ServerError }) 
  },
  { 
    path: '/empty', 
    lazy: async () => ({ Component: (await import('./pages/EmptyStatePage')).EmptyStatePage }) 
  },
])
