import React from 'react'
import { HardDrive } from 'lucide-react'
import { ModulePlaceholder } from '@/components/module-placeholder'

export default function BucketPage() {
  return (
    <ModulePlaceholder
      title="Bucket"
      description="Storage repository for creator media, raw footage, thumbnails, and asset archives."
      icon={HardDrive}
      owner="bhavya"
      isComingSoon={true}
      actionLabel="Notify when ready"
    />
  )
}
