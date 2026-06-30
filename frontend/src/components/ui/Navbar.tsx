import { Search, Bell } from "lucide-react"
import { useAuthStore } from "../../store/auth"
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar"

export function Navbar() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border-default bg-surface/80 px-4 md:px-8 backdrop-blur-md transition-all">
      {/* Mobile padding spacer to avoid overlapping the hamburger menu */}
      <div className="md:hidden w-10"></div>
      
      {/* Search Bar (Centered on desktop, hidden on small mobile if tight) */}
      <div className="flex-1 max-w-xl mx-auto flex items-center">
        <div className="relative w-full max-w-md group hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search rooms..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.location.href = `/rooms?q=${encodeURIComponent(e.currentTarget.value)}`;
              }
            }}
            className="h-10 w-full rounded-full border border-[rgba(255,255,255,0.08)] bg-surface-hover/50 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-4 ml-4">
        
        {/* Connection Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-bg/10 border border-success-bg/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-text opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success-text"></span>
          </span>
          <span className="text-xs font-medium text-success-text">Connected</span>
        </div>



        {/* Notifications */}
        <button className="relative h-10 w-10 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors focus:outline-none">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-primary ring-2 ring-surface"></span>
        </button>

        {/* User Mini Profile */}
        <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-border-default ml-2">
           <Avatar className="h-8 w-8 border border-border-default">
              <AvatarImage src={user?.profile?.avatar || ''} />
              <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-xs font-medium">
                {user?.profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
        </div>
      </div>
    </header>
  )
}
