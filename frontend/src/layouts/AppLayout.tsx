import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/ui/Sidebar'
import { Navbar } from '../components/ui/Navbar'

/**
 * AppLayout — Primary application shell with unified SaaS design language.
 */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      {/* Global Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
        
        {/* Global Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden relative focus:outline-none" 
          id="main-content"
          tabIndex={-1}
        >
          {/* Framer motion wrapper can go here for page transitions later */}
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
