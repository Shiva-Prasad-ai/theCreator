import React from 'react'
import { BarChart3 } from 'lucide-react'
import { ModulePlaceholder } from '@/components/module-placeholder'

export default function SalesPage() {
  return (
    <ModulePlaceholder
      title="Sales & Conversions"
      description="Funnel conversions, course sales analytics, checkout success rates, and customer lifetime value."
      icon={BarChart3}
      owner="shiva"
      actionLabel="Export Sales Report"
    />
  )
}
