import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import { router } from './router'
import { RealtimeProvider } from "./providers/RealtimeProvider";
import { ConnectionIndicator } from "./components/realtime/ConnectionIndicator";
import { ReconnectBanner } from "./components/realtime/ReconnectBanner";
import { CookieConsent } from "./components/CookieConsent";

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <RealtimeProvider>
      <ConnectionIndicator />
      <ReconnectBanner />
      <CookieConsent />
      <RouterProvider router={router} />
    </RealtimeProvider>
  )
}

export default App
