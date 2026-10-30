import React from 'react'
import { Bell } from 'lucide-react'
import { ModulePlaceholder } from '@/components/module-placeholder'

export default function NotificationsPage() {
  return (
    <ModulePlaceholder
      title="Notifications & Alerts"
      description="System alerts, workflow triggers, milestone achievements, and platform updates."
      icon={Bell}
      owner="shiva"
      actionLabel="Mark all as read"
    />
  )
}
