import React from 'react'
import { Link2 } from 'lucide-react'
import { ModulePlaceholder } from '@/components/module-placeholder'

export default function ConnectionsPage() {
  return (
    <ModulePlaceholder
      title="Connected Accounts & APIs"
      description="Manage OAuth connections to YouTube, Twitter, Instagram, TikTok, Substack, and Stripe."
      icon={Link2}
      owner="shiva"
      actionLabel="Connect New Platform"
    />
  )
}
