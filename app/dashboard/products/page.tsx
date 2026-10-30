import React from 'react'
import { Package } from 'lucide-react'
import { ModulePlaceholder } from '@/components/module-placeholder'

export default function ProductsPage() {
  return (
    <ModulePlaceholder
      title="Product Suite"
      description="Define your digital products, SaaS tools, ICP personas, and value propositions."
      icon={Package}
      owner="shiva"
      actionLabel="Create New Product"
    />
  )
}
