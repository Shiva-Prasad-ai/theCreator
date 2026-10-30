'use client'

import React, { useState } from 'react'
import { Product } from '@/lib/beluga/types'
import { saveProduct } from '@/lib/beluga/actions'
import { Button } from '@/components/ui/button'
import { Package, X, Loader2, AlertCircle } from 'lucide-react'

interface ProductFormProps {
  product?: Product | null
  onSuccess: (product: Product) => void
  onCancel: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '')
  const [industry, setIndustry] = useState(product?.industry || '')
  const [icp, setIcp] = useState(product?.icp || '')
  const [description, setDescription] = useState(product?.description || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (name.trim().length < 2) {
      setErrorMessage('Product name must be at least 2 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await saveProduct({
        id: product?.id,
        name: name.trim(),
        industry: industry.trim(),
        icp: icp.trim(),
        description: description.trim(),
      })

      if (!res.success || !res.product) {
        setErrorMessage(res.error || 'Failed to save product.')
        setIsSubmitting(false)
        return
      }

      onSuccess(res.product)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setErrorMessage(msg)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              {product ? 'Edit Creator Product' : 'Register New Product'}
            </h3>
            <p className="text-xs text-muted-foreground">
              Define your product proposition, target industry, and ideal buyer persona.
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Product Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CreatorPulse Analytics, VideoFlow Plugin, Studio SaaS"
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Industry / Domain Category
          </label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. AI & Creator Tools, Enterprise SaaS, EdTech, Media & Broadcasting"
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Ideal Customer Profile (ICP) & Target Market
          </label>
          <textarea
            rows={2}
            value={icp}
            onChange={(e) => setIcp(e.target.value)}
            placeholder="e.g. B2B creator agencies with 10-100 staff, video podcasters, or early SaaS founders"
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Value Proposition & Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the core problem solved, primary feature set, and pricing model."
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Saving Product...
              </>
            ) : product ? (
              'Update Product'
            ) : (
              'Save & Activate Radar'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
