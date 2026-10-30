import React from 'react'
import { TrendingUp } from 'lucide-react'
import { ModulePlaceholder } from '@/components/module-placeholder'

export default function EarningsPage() {
  return (
    <ModulePlaceholder
      title="Earnings & Revenue"
      description="Track sponsorship payouts, affiliate earnings, platform rev-shares, and manual revenue logs."
      icon={TrendingUp}
      owner="shiva"
      actionLabel="Log New Revenue Entry"
    />
  )
}
