import React from 'react'
import { CheckSquare } from 'lucide-react'
import { ModulePlaceholder } from '@/components/module-placeholder'

export default function ApprovalsPage() {
  return (
    <ModulePlaceholder
      title="Approvals"
      description="Content review workflows, brand sponsor sign-offs, and staged publication approvals."
      icon={CheckSquare}
      owner="bhavya"
      isComingSoon={true}
    />
  )
}
