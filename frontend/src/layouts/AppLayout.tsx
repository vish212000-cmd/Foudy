import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AuthService } from '../services/auth'
import { useAuthStore } from '../store/auth'
import { cn } from '../lib/utils'
import {
  Home,
  Users,
  MessageSquare,
  Bell,
  Settings,
  Radio,
  LogOut,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '../components/ui/Avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip'

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/match', icon: Radio, label: 'Random Match' },
  { to: '/rooms', icon: Users, label: 'Rooms' },
  { to: '/chat', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

/**
 * AppLayout — Primary application shell with sidebar navigation.
 * Used by: Home, Profile, Settings, Notifications, Rooms, etc.
 */
export function AppLayout() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await AuthService.logout()
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 md:w-64 border-r border-border-default bg-surface flex flex-col z-20 transition-all">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border-default shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shrink-0">
              <span className="text-text-inverse font-bold text-sm">F</span>
            </div>
            <span className="hidden md:block font-semibold text-text-primary text-lg tracking-tight">
              FOUDY
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto" aria-label="Main navigation">
          <TooltipProvider>
            <ul className="space-y-1 px-2">
              {navItems.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                            isActive
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                          )
                        }
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="hidden md:block">{label}</span>
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="md:hidden">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </TooltipProvider>
        </nav>

        {/* Bottom items */}
        <div className="py-4 px-2 border-t border-border-default space-y-1">
          <TooltipProvider>
            {bottomItems.map(({ to, icon: Icon, label }) => (
              <Tooltip key={to}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors w-full',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                        isActive
                          ? 'bg-brand-primary/10 text-brand-primary'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      )
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="hidden md:block">{label}</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="md:hidden">{label}</TooltipContent>
              </Tooltip>
            ))}

            {/* Profile link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors w-full',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                      isActive
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    )
                  }
                >
                  <Avatar className="h-5 w-5 shrink-0">
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block">Profile</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden">Profile</TooltipContent>
            </Tooltip>

            {/* Logout link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="hidden md:block">Log out</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden">Log out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="flex-1 ml-16 md:ml-64 min-h-screen"
        id="main-content"
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  )
}
