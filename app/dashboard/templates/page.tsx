'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Layers,
  Plus,
  DollarSign,
  TrendingUp,
  Tag,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Template, TemplateStatus } from '@/lib/templates/types'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaleOpen, setIsSaleOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    price: 49,
    category: 'Design Systems',
    status: 'draft' as TemplateStatus,
  })

  // Sale form states
  const [saleQuantity, setSaleQuantity] = useState<number>(1)
  const [addToEarnings, setAddToEarnings] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/templates')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch templates')
      }
      const data = await res.json()
      setTemplates(data || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading templates'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Open Create Dialog
  const handleOpenAdd = () => {
    setFormData({
      title: '',
      price: 49,
      category: 'Design Systems',
      status: 'draft',
    })
    setIsAddOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (t: Template) => {
    setSelectedTemplate(t)
    setFormData({
      title: t.title,
      price: Number(t.price),
      category: t.category || 'General',
      status: (t.status as TemplateStatus) || 'draft',
    })
    setIsEditOpen(true)
  }

  // Open Record Sale Dialog
  const handleOpenSale = (t: Template) => {
    setSelectedTemplate(t)
    setSaleQuantity(1)
    setAddToEarnings(true)
    setIsSaleOpen(true)
  }

  // Create Template
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create template')
      }
      setIsAddOpen(false)
      await fetchTemplates()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create template'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Edit Template
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return

    try {
      setSubmitting(true)
      setError(null)
      const res = await fetch(`/api/templates/${selectedTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update template')
      }
      setIsEditOpen(false)
      setSelectedTemplate(null)
      await fetchTemplates()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update template'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Record Sale
  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return

    try {
      setSubmitting(true)
      setError(null)
      const res = await fetch(`/api/templates/${selectedTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          increment_sales: saleQuantity,
          add_to_earnings: addToEarnings,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to record sale')
      }
      setIsSaleOpen(false)
      setSelectedTemplate(null)
      await fetchTemplates()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record sale'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Template
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete template "${title}"?`)) return

    try {
      setError(null)
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete template')
      }
      await fetchTemplates()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete template'
      setError(msg)
    }
  }

  // Aggregations
  const totalSales = templates.reduce((acc, t) => acc + (t.sales || 0), 0)
  const totalRevenue = templates.reduce(
    (acc, t) => acc + Number(t.price || 0) * (t.sales || 0),
    0
  )
  const listedCount = templates.filter((t) => t.status === 'listed').length

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'listed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Listed
          </span>
        )
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            Paused
          </span>
        )
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
            Draft
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Freelancer Deliverable Templates
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Package client deliverables, Notion frameworks, UI kits, and dev starters. Track licensing sales and record manual earnings.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="font-semibold shadow-sm shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Template
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Templates
          </span>
          <p className="mt-1 text-2xl font-bold text-foreground">{templates.length}</p>
          <span className="text-xs text-muted-foreground">{listedCount} active on market</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Sales
          </span>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalSales}</p>
          <span className="text-xs text-muted-foreground">Units sold across catalog</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Catalog Revenue
          </span>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-muted-foreground">Cumulative template gross</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Avg Price / Unit
          </span>
          <p className="mt-1 text-2xl font-bold text-foreground">
            $
            {templates.length > 0
              ? (
                  templates.reduce((acc, t) => acc + Number(t.price || 0), 0) /
                  templates.length
                ).toFixed(2)
              : '0.00'}
          </p>
          <span className="text-xs text-muted-foreground">Standard bundle value</span>
        </div>
      </div>

      {/* Templates Table or Empty State */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">No Templates Created Yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              List your reusable deliverables, wireframe kits, or code libraries to monetize freelance assets.
            </p>
            <Button onClick={handleOpenAdd} size="sm" className="mt-4">
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Template
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Template Title</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Sales Count</th>
                  <th className="px-5 py-3.5">Revenue</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {templates.map((t) => {
                  const rev = Number(t.price || 0) * (t.sales || 0)
                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 font-semibold text-foreground">
                        {t.title}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        <span className="rounded bg-muted px-2 py-0.5 font-medium">
                          {t.category || 'General'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-medium text-foreground">
                        ${Number(t.price || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">
                        {t.sales || 0}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-foreground">
                        ${rev.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenSale(t)}
                            className="h-8 gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/20"
                          >
                            <DollarSign className="h-3.5 w-3.5" />
                            Record Sale
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEdit(t)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(t.id, t.title)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Create Template Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-bold text-foreground text-base">Create Deliverable Template</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Template Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js SaaS Starter Kit"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as TemplateStatus,
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="listed">Listed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Starter, Figma UI Kit, Notion OS"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Create Template
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {isEditOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-bold text-foreground text-base">Edit Template</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Template Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as TemplateStatus,
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="listed">Listed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      {isSaleOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-foreground text-base">Record Template Sale</h3>
              </div>
              <button
                onClick={() => setIsSaleOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordSale} className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs space-y-1">
                <span className="text-muted-foreground uppercase tracking-wider font-semibold">
                  Product Item
                </span>
                <p className="font-bold text-foreground text-sm">{selectedTemplate.title}</p>
                <div className="flex justify-between items-center text-muted-foreground pt-1">
                  <span>Unit Price:</span>
                  <span className="font-mono font-semibold text-foreground">
                    ${Number(selectedTemplate.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quantity Sold
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none font-mono"
                />
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex justify-between items-center text-sm">
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  Gross Sale Amount:
                </span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  ${(Number(selectedTemplate.price || 0) * saleQuantity).toFixed(2)}
                </span>
              </div>

              {/* Also add to earnings checkbox */}
              <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5">
                <input
                  type="checkbox"
                  id="addToEarningsCheckbox"
                  checked={addToEarnings}
                  onChange={(e) => setAddToEarnings(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="addToEarningsCheckbox"
                  className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none"
                >
                  <strong className="text-foreground block">Also add to earnings</strong>
                  Automatically creates a manual transaction row (<code>entry_type: &apos;manual&apos;</code>) in your Earnings ledger.
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaleOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Confirm Sale
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
