import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { CallLayout } from './layouts/CallLayout'
import { Splash } from './pages/Splash'
import { Welcome } from './pages/Welcome'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { Notifications } from './pages/Notifications'
import { RandomMatch } from './pages/RandomMatch'
import { Searching } from './pages/Searching'
import { MatchFound } from './pages/MatchFound'
import { CreateRoom } from './pages/CreateRoom'
import { JoinRoom } from './pages/JoinRoom'
import { GroupRoom } from './pages/GroupRoom'
import { VideoChat } from './pages/VideoChat'
import { AudioChat } from './pages/AudioChat'
import { TextChat } from './pages/TextChat'
import { BlockedUsers } from './pages/BlockedUsers'
import { ReportUser } from './pages/ReportUser'
import { HelpSupport } from './pages/HelpSupport'
import { Privacy } from './pages/Privacy'
import { NoInternet } from './pages/NoInternet'
import { ServerError } from './pages/ServerError'
import { EmptyStatePage } from './pages/EmptyStatePage'

export const router = createBrowserRouter([
  // ─── Splash / Onboarding ───────────────────────────────────────────────────
  { path: '/', element: <Splash /> },
  { path: '/welcome', element: <Welcome /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // ─── Call / Immersive screens ──────────────────────────────────────────────
  {
    element: <CallLayout />,
    children: [
      { path: '/searching', element: <Searching /> },
      { path: '/match-found', element: <MatchFound /> },
      { path: '/video-chat', element: <VideoChat /> },
      { path: '/audio-chat', element: <AudioChat /> },
    ],
  },

  // ─── Standalone full-page screens ─────────────────────────────────────────
  { path: '/match', element: <RandomMatch /> },
  { path: '/group-room', element: <GroupRoom /> },
  { path: '/text-chat', element: <TextChat /> },
  { path: '/report', element: <ReportUser /> },
  { path: '/no-internet', element: <NoInternet /> },
  { path: '/server-error', element: <ServerError /> },
  { path: '/empty', element: <EmptyStatePage /> },

  // ─── App layout screens ───────────────────────────────────────────────────
  {
    element: <AppLayout />,
    children: [
      { path: '/home', element: <Home /> },
      { path: '/profile', element: <Profile /> },
      { path: '/settings', element: <Settings /> },
      { path: '/notifications', element: <Notifications /> },
      { path: '/rooms', element: <JoinRoom /> },
      { path: '/rooms/create', element: <CreateRoom /> },
      { path: '/help', element: <HelpSupport /> },
      { path: '/privacy', element: <Privacy /> },
      { path: '/blocked', element: <BlockedUsers /> },
    ],
  },
])
