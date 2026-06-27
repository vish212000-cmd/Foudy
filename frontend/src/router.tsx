import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { GuestRoute } from './components/auth/GuestRoute'
import { AppLayout } from './layouts/AppLayout'
import { CallLayout } from './layouts/CallLayout'
import { Splash } from './pages/Splash'
import { Welcome } from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import { Profile } from './pages/Profile'
import { ProfileSetup } from './pages/ProfileSetup'
import { Settings } from './pages/Settings'
import RandomMatch from './pages/RandomMatch'
import Searching from './pages/Searching'
import MatchFound from './pages/MatchFound'
import { BlockedUsers } from './pages/BlockedUsers'
import { NoInternet } from './pages/NoInternet'
import { ServerError } from './pages/ServerError'
import { EmptyStatePage } from './pages/EmptyStatePage'

export const router = createBrowserRouter([
  // ─── Splash / Onboarding ───────────────────────────────────────────────────
  { path: '/', element: <Splash /> },
  { path: '/welcome', element: <Welcome /> },
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ]
  },

  // ─── Call / Immersive screens ──────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <CallLayout />,
        children: [
          { path: '/searching', element: <Searching /> },
          { path: '/match-found', element: <MatchFound /> },
        ],
      },
      // ─── App layout screens ───────────────────────────────────────────────────
      {
        element: <AppLayout />,
        children: [
          { path: '/match', element: <RandomMatch /> },
          { path: '/setup', element: <ProfileSetup /> },
          { path: '/settings', element: <Settings /> },
          { path: '/profile', element: <Profile /> },
          { path: '/rooms', element: <div className="p-8"><h1 className="text-2xl font-bold">Rooms (Coming Soon)</h1></div> },
          { path: '/chat', element: <div className="p-8"><h1 className="text-2xl font-bold">Messages (Coming Soon)</h1></div> },
          { path: '/blocked', element: <BlockedUsers /> },
          // Redirect unknown routes to profile for now to avoid broken nav
          { path: '*', element: <Navigate to="/profile" replace /> }
        ],
      },
    ]
  },

  // ─── Standalone full-page screens ─────────────────────────────────────────
  { path: '/no-internet', element: <NoInternet /> },
  { path: '/server-error', element: <ServerError /> },
  { path: '/empty', element: <EmptyStatePage /> },
])
