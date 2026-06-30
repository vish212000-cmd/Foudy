import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { 
  Home, Users, MessageSquare, Bell, Settings, Radio, 
  LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';
import { useAuthStore } from '../../store/auth';
import { AuthService } from '../../services/auth';

const topNavItems = [
  { to: '/home', icon: Home, label: 'Dashboard' },
  { to: '/match', icon: Radio, label: 'Random Match' },
  { to: '/rooms', icon: Users, label: 'Rooms' },
  { to: '/chat', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

const bottomNavItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } finally {
      logout();
      navigate('/login');
    }
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname.startsWith(to);
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={to}
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 my-1 text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
              isActive 
                ? "bg-brand-primary/10 text-brand-primary font-semibold shadow-sm" 
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-brand-primary" : "")} />
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            {isActive && !isCollapsed && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute left-0 w-1 h-8 bg-brand-primary rounded-r-md"
              />
            )}
          </NavLink>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="font-medium">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-surface border-r border-border-default shadow-lg md:shadow-none">
      {/* Header / Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-border-default">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary shadow-sm">
            <span className="text-sm font-bold text-white">F</span>
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap font-bold text-lg text-text-primary tracking-tight"
              >
                FOUDY
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          className="md:hidden p-1 rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <TooltipProvider delayDuration={0}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-hide">
          <nav className="flex flex-col gap-1">
            {topNavItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-auto px-3 py-4 border-t border-border-default space-y-1">
          {bottomNavItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 my-1 text-sm font-medium transition-all duration-200",
                  "text-danger-text hover:bg-danger-bg/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-text"
                )}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      Log out
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="font-medium text-danger-text">
                Log out
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* User Profile Footer */}
      <div className={cn(
        "p-4 border-t border-border-default transition-all duration-300",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <NavLink to="/profile" onClick={() => setIsMobileOpen(false)}>
          <div className="flex items-center gap-3 rounded-lg hover:bg-surface-hover p-2 -m-2 transition-colors">
            <Avatar className="h-9 w-9 border border-border-default shrink-0">
              <AvatarImage src={user?.profile?.avatar || ''} />
              <AvatarFallback className="bg-brand-primary/10 text-brand-primary">
                {user?.profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col overflow-hidden"
                >
                  <span className="text-sm font-semibold text-text-primary truncate">{user?.profile?.display_name || 'User'}</span>
                  <span className="text-xs text-text-tertiary truncate">{user?.email}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </NavLink>
      </div>
      
      {/* Collapse Toggle (Desktop only) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border border-border-default bg-surface text-text-secondary hover:text-text-primary hover:scale-110 transition-transform shadow-sm z-50"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 left-0 z-40 h-16 flex items-center px-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 rounded-md text-text-secondary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand-primary bg-surface/50 backdrop-blur-sm"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 256,
          x: isMobileOpen ? 0 : (window.innerWidth < 768 ? -256 : 0)
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className={cn(
          "fixed top-0 left-0 z-50 h-full",
          "md:translate-x-0" 
        )}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
