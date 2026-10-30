'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  GraduationCap,
  Plus,
  DollarSign,
  TrendingUp,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  Share2,
  Copy,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Course, CourseStatus } from '@/lib/courses/types'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Gateway ad_copy availability flag and response badges
  const [adCopyAvailable, setAdCopyAvailable] = useState<boolean>(false)
  const [adCopyLabel, setAdCopyLabel] = useState<string>('sample')
  const [adCopySource, setAdCopySource] = useState<string | null>(null)

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaleOpen, setIsSaleOpen] = useState(false)
  const [isPromoOpen, setIsPromoOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    price: 99,
    category: 'Cohort Course',
    status: 'draft' as CourseStatus,
  })

  // Sale form states
  const [saleQuantity, setSaleQuantity] = useState<number>(1)
  const [addToEarnings, setAddToEarnings] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Promo form states
  const [promoPlatform, setPromoPlatform] = useState<string>('Twitter/X')
  const [promoVariants, setPromoVariants] = useState<string[]>([])
  const [promoLoding, setPromoLoading] = useState<boolean>(false)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoLabel, setPromoLabel] = useState<string>('sample')
  const [promoSource, setPromoSource] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/courses')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch courses')
      }
      const data = await res.json()
      setCourses(data || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading courses'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const formatAiBadge = (lbl?: string | null) => {
    if (lbl === 'sample') return 'Sample'
    if (lbl === 'ai_suggested') return 'AI-suggested'
    return lbl === 'sample' ? 'Sample' : 'AI-suggested'
  }

  // Check if gateway is available for ad_copy. If not, hide the button.
  const checkAdCopyAvailability = useCallback(async () => {
    try {
      const res = await fetch('/api/courses/ad-copy')
      if (res.ok) {
        const data = await res.json()
        setAdCopyAvailable(Boolean(data.available))
        if (data.label) setAdCopyLabel(data.label)
      } else {
        setAdCopyAvailable(false)
      }
    } catch {
      setAdCopyAvailable(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
    checkAdCopyAvailability()
  }, [fetchCourses, checkAdCopyAvailability])

  // Open Create Dialog
  const handleOpenAdd = () => {
    setFormData({
      title: '',
      price: 99,
      category: 'Cohort Course',
      status: 'draft',
    })
    setIsAddOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (c: Course) => {
    setSelectedCourse(c)
    setFormData({
      title: c.title,
      price: Number(c.price),
      category: c.category || 'General',
      status: (c.status as CourseStatus) || 'draft',
    })
    setIsEditOpen(true)
  }

  // Open Record Sale Dialog
  const handleOpenSale = (c: Course) => {
    setSelectedCourse(c)
    setSaleQuantity(1)
    setAddToEarnings(true)
    setIsSaleOpen(true)
  }

  // Open Promotion Content Dialog
  const handleOpenPromo = async (c: Course) => {
    setSelectedCourse(c)
    setPromoVariants([])
    setIsPromoOpen(true)
    await generatePromo(c, promoPlatform)
  }

  const generatePromo = async (courseItem: Course, platform: string) => {
    try {
      setPromoLoading(true)
      setPromoError(null)
      setPromoVariants([]) // Never display fallback copy

      const res = await fetch('/api/courses/ad-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: {
            title: courseItem.title,
            category: courseItem.category,
            price: courseItem.price,
          },
          platform,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg = data.error?.message || data.error || 'Promotion generation unavailable'
        setPromoError(msg)
        setPromoVariants([])
        return
      }

      setPromoVariants(data.variants || [])
      if (data.label) {
        setPromoLabel(data.label)
        setAdCopyLabel(data.label)
      }
      if (data.source) {
        setPromoSource(data.source)
        setAdCopySource(data.source)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gateway unavailable'
      setPromoError(msg)
      setPromoVariants([])
    } finally {
      setPromoLoading(false)
    }
  }

  // Create Course
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create course')
      }
      setIsAddOpen(false)
      await fetchCourses()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create course'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Edit Course
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return

    try {
      setSubmitting(true)
      setError(null)
      const res = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update course')
      }
      setIsEditOpen(false)
      setSelectedCourse(null)
      await fetchCourses()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update course'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Record Sale
  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return

    try {
      setSubmitting(true)
      setError(null)
      const res = await fetch(`/api/courses/${selectedCourse.id}`, {
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
      setSelectedCourse(null)
      await fetchCourses()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record sale'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Course
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete course "${title}"?`)) return

    try {
      setError(null)
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete course')
      }
      await fetchCourses()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete course'
      setError(msg)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Aggregations
  const totalSales = courses.reduce((acc, c) => acc + (c.sales || 0), 0)
  const totalRevenue = courses.reduce(
    (acc, c) => acc + Number(c.price || 0) * (c.sales || 0),
    0
  )
  const publishedCount = courses.filter((c) => c.status === 'published' || c.status === 'listed').length

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'published':
      case 'listed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Published
          </span>
        )
      case 'archived':
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            Archived
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
              <GraduationCap className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Educator Course & Curriculum Tracker
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Track student enrollments, cohort revenue, and launch campaigns. Connect curriculum sales directly to your platform earnings.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="font-semibold shadow-sm shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Course
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
            Total Courses
          </span>
          <p className="mt-1 text-2xl font-bold text-foreground">{courses.length}</p>
          <span className="text-xs text-muted-foreground">{publishedCount} published cohorts</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Students / Sales
          </span>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalSales}</p>
          <span className="text-xs text-muted-foreground">Enrolled student seats</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Course Revenue
          </span>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-muted-foreground">Cumulative tuition gross</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Avg Tuition
          </span>
          <p className="mt-1 text-2xl font-bold text-foreground">
            $
            {courses.length > 0
              ? (
                  courses.reduce((acc, c) => acc + Number(c.price || 0), 0) /
                  courses.length
                ).toFixed(2)
              : '0.00'}
          </p>
          <span className="text-xs text-muted-foreground">Average course ticket</span>
        </div>
      </div>

      {/* Courses Table or Empty State */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">No Courses Published Yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Create your first online workshop, video cohort, or masterclass curriculum to track enrollments.
            </p>
            <Button onClick={handleOpenAdd} size="sm" className="mt-4">
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Course
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Course Title</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Tuition / Price</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Students / Sales</th>
                  <th className="px-5 py-3.5">Total Revenue</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((c) => {
                  const rev = Number(c.price || 0) * (c.sales || 0)
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 font-semibold text-foreground">
                        {c.title}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        <span className="rounded bg-muted px-2 py-0.5 font-medium">
                          {c.category || 'General'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-medium text-foreground">
                        ${Number(c.price || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">
                        {c.sales || 0}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-foreground">
                        ${rev.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Promotion Content button with AI badge from response label */}
                          {adCopyAvailable && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenPromo(c)}
                              className="h-8 gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10 border-primary/20"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
                              <span>Promotion content</span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                                  adCopyLabel === 'sample'
                                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                    : 'bg-primary/15 text-primary'
                                }`}
                              >
                                {formatAiBadge(adCopyLabel)}
                              </span>
                              {adCopySource === 'memory' && (
                                <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-sky-700 dark:text-sky-300">
                                  served from memory
                                </span>
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenSale(c)}
                            className="h-8 gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/20"
                          >
                            <DollarSign className="h-3.5 w-3.5" />
                            Record Sale
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEdit(c)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(c.id, c.title)}
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

      {/* Add / Create Course Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-bold text-foreground text-base">Create New Course</h3>
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
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack AI Engineer Masterclass"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tuition (USD)
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
                        status: e.target.value as CourseStatus,
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4-Week Cohort, Video Masterclass, Workshop"
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
                  Create Course
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {isEditOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-bold text-foreground text-base">Edit Course</h3>
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
                  Course Title
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
                    Tuition (USD)
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
                        status: e.target.value as CourseStatus,
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
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

      {/* Record Sale / Enrollment Modal */}
      {isSaleOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-foreground text-base">Record Student Enrollment</h3>
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
                  Course
                </span>
                <p className="font-bold text-foreground text-sm">{selectedCourse.title}</p>
                <div className="flex justify-between items-center text-muted-foreground pt-1">
                  <span>Tuition per student:</span>
                  <span className="font-mono font-semibold text-foreground">
                    ${Number(selectedCourse.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Enrollments / Seats
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
                  Gross Tuition Collected:
                </span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  ${(Number(selectedCourse.price || 0) * saleQuantity).toFixed(2)}
                </span>
              </div>

              {/* Also add to earnings checkbox */}
              <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5">
                <input
                  type="checkbox"
                  id="addToEarningsCourseCheckbox"
                  checked={addToEarnings}
                  onChange={(e) => setAddToEarnings(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="addToEarningsCourseCheckbox"
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
                  Confirm Enrollment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Content Modal */}
      {isPromoOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-foreground text-base">Course Promotion Content</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    promoLabel === 'sample'
                      ? 'border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      : 'border border-primary/20 bg-primary/10 text-primary'
                  }`}
                >
                  {formatAiBadge(promoLabel)}
                </span>
                {promoSource === 'memory' && (
                  <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                    served from memory
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsPromoOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground font-medium">
                Generating copy for: <strong className="text-foreground">{selectedCourse.title}</strong>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Platform:</span>
                <select
                  value={promoPlatform}
                  onChange={(e) => {
                    const next = e.target.value
                    setPromoPlatform(next)
                    if (selectedCourse) generatePromo(selectedCourse, next)
                  }}
                  className="rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none"
                >
                  <option value="Twitter/X">Twitter/X</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Newsletter">Newsletter</option>
                </select>
              </div>
            </div>

            {promoLoding ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">
                  Calling AI gateway task <code>ad_copy</code>...
                </p>
              </div>
            ) : promoError ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Ad Copy Generation Failed</span>
                </div>
                <p className="pl-6 text-[11px] leading-relaxed">{promoError}</p>
                <p className="pl-6 text-[10px] text-muted-foreground italic">
                  Fallback copy is disabled by system policy.
                </p>
              </div>
            ) : promoVariants.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                No variants returned by the gateway.
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {promoVariants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl border border-border bg-muted/30 p-4 text-xs leading-relaxed text-foreground space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold uppercase tracking-wider">
                        Variant {idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                            promoLabel === 'sample'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {formatAiBadge(promoLabel)}
                        </span>
                        {promoSource === 'memory' && (
                          <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-300">
                            served from memory
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap">{variant}</p>
                    <div className="flex justify-end pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(variant, idx)}
                        className="h-7 text-xs gap-1"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setIsPromoOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
