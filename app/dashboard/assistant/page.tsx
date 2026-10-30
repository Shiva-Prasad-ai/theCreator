import React from 'react'
import { Sparkles } from 'lucide-react'
import { ModulePlaceholder } from '@/components/module-placeholder'

export default function AssistantPage() {
  return (
    <ModulePlaceholder
      title="AI Assistant"
      description="Autonomous creator intelligence, content ideation, script drafting, and memory retrieval."
      icon={Sparkles}
      owner="tilak"
      isComingSoon={true}
    />
  )
}
