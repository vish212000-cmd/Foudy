import { Bell } from "lucide-react"
import { EmptyState } from "../components/ui/EmptyState"

export function Notifications() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Notifications</h1>
        <p className="text-text-secondary mt-1">Stay updated with your latest alerts and matches.</p>
      </div>

      <div className="mt-12">
        <EmptyState
          aria-label="No notifications empty state"
          icon={<Bell className="h-8 w-8 text-text-tertiary" aria-hidden="true" strokeWidth={1.5} />}
          title="No Notifications"
          description="You're all caught up! We'll notify you when something needs your attention."
        />
      </div>
    </div>
  )
}
