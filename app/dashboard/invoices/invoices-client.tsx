'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  FileText,
  Plus,
  DollarSign,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Send,
  Edit2,
  Trash2,
  X,
  Loader2,
  Search,
  Receipt,
  User,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  InvoiceWithComputed,
  computeSubtotal,
  computeTaxAmount,
  computeTotal,
  isInvoiceOverdue,
  getDerivedStatus,
  getInvoiceNumber,
  withComputedInvoice,
} from '@/lib/modules/invoices'

interface InvoicesClientProps {
  currentPersona: string
}

export function InvoicesClient({ currentPersona }: InvoicesClientProps) {
  const [invoices, setInvoices] = useState<InvoiceWithComputed[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithComputed | null>(null)
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceWithComputed | null>(null)

  // Form State
  const [client, setClient] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [tax, setTax] = useState<number>(0)
  const [status, setStatus] = useState<InvoiceStatus>('draft')
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0 },
  ])
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Live Calculations for Create/Edit Dialog
  const liveSubtotal = useMemo(() => computeSubtotal(items), [items])
  const liveTaxAmount = useMemo(() => computeTaxAmount(items, tax), [items, tax])
  const liveTotal = useMemo(() => computeTotal(items, tax), [items, tax])

  // Fetch Invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/invoices')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch invoices')
      }
      const data: Invoice[] = await res.json()
      // Augment each invoice with computed total & derived status
      const enriched = (data || []).map(withComputedInvoice)
      setInvoices(enriched)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading invoices'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // Copy invoice number to clipboard
  const handleCopyInvoiceNumber = (id: string) => {
    const invNum = getInvoiceNumber(id)
    navigator.clipboard.writeText(invNum)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Open Create Dialog
  const handleOpenCreate = () => {
    setClient('')
    setDueDate('')
    setTax(0)
    setStatus('draft')
    setItems([{ description: '', quantity: 1, unit_price: 0 }])
    setFormError(null)
    setIsCreateOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (inv: InvoiceWithComputed) => {
    setSelectedInvoice(inv)
    setClient(inv.client)
    setDueDate(inv.due_date || '')
    setTax(Number(inv.tax) || 0)
    setStatus(inv.status)
    setItems(
      Array.isArray(inv.items) && inv.items.length > 0
        ? inv.items.map((it) => ({
            description: it.description || '',
            quantity: Number(it.quantity) || 1,
            unit_price: Number(it.unit_price) || 0,
          }))
        : [{ description: '', quantity: 1, unit_price: 0 }]
    )
    setFormError(null)
    setIsEditOpen(true)
  }

  // Open Delete Dialog
  const handleOpenDelete = (inv: InvoiceWithComputed) => {
    setInvoiceToDelete(inv)
    setIsDeleteOpen(true)
  }

  // Line Item Handlers
  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items]
    if (field === 'description') {
      newItems[index] = { ...newItems[index], description: String(value) }
    } else if (field === 'quantity') {
      newItems[index] = { ...newItems[index], quantity: Math.max(0, Number(value) || 0) }
    } else if (field === 'unit_price') {
      newItems[index] = { ...newItems[index], unit_price: Math.max(0, Number(value) || 0) }
    }
    setItems(newItems)
  }

  // Validate form client-side before API dispatch
  const validateForm = () => {
    if (!client.trim()) {
      setFormError('Client name is required.')
      return false
    }
    if (items.length === 0) {
      setFormError('At least one line item is required.')
      return false
    }
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (!it.description.trim()) {
        setFormError(`Item #${i + 1} is missing a description.`)
        return false
      }
      if (it.quantity <= 0) {
        setFormError(`Item #${i + 1} quantity must be greater than 0.`)
        return false
      }
      if (it.unit_price < 0) {
        setFormError(`Item #${i + 1} unit price cannot be negative.`)
        return false
      }
    }
    if (tax < 0 || tax > 100) {
      setFormError('Tax must be between 0% and 100%.')
      return false
    }
    setFormError(null)
    return true
  }

  // Submit Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)
      setFormError(null)

      const payload = {
        client: client.trim(),
        due_date: dueDate || null,
        tax: Number(tax) || 0,
        status,
        items: items.map((it) => ({
          description: it.description.trim(),
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
        })),
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create invoice')
      }

      setIsCreateOpen(false)
      await fetchInvoices()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating invoice'
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoice) return
    if (!validateForm()) return

    try {
      setSubmitting(true)
      setFormError(null)

      const payload = {
        client: client.trim(),
        due_date: dueDate || null,
        tax: Number(tax) || 0,
        status,
        items: items.map((it) => ({
          description: it.description.trim(),
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
        })),
      }

      const res = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update invoice')
      }

      setIsEditOpen(false)
      setSelectedInvoice(null)
      await fetchInvoices()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating invoice'
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Invoice
  const handleDelete = async () => {
    if (!invoiceToDelete) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/invoices/${invoiceToDelete.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete invoice')
      }

      setIsDeleteOpen(false)
      setInvoiceToDelete(null)
      await fetchInvoices()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting invoice'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Status filter
      if (filterStatus === 'draft' && inv.status !== 'draft') return false
      if (filterStatus === 'sent' && inv.status !== 'sent') return false
      if (filterStatus === 'paid' && inv.status !== 'paid') return false
      if (filterStatus === 'overdue' && !inv.is_overdue) return false

      // Search filter: client name or first 8 chars of id
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchClient = inv.client.toLowerCase().includes(q)
        const matchNum = getInvoiceNumber(inv.id).toLowerCase().includes(q)
        return matchClient || matchNum
      }

      return true
    })
  }, [invoices, filterStatus, searchQuery])

  // Metric Aggregations
  const totalPaidRevenue = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((acc, inv) => acc + inv.total, 0)
  }, [invoices])

  const totalOutstanding = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'sent')
      .reduce((acc, inv) => acc + inv.total, 0)
  }, [invoices])

  const overdueInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.is_overdue)
  }, [invoices])

  const totalOverdueAmount = useMemo(() => {
    return overdueInvoices.reduce((acc, inv) => acc + inv.total, 0)
  }, [overdueInvoices])

  // Status Badge Component
  const renderStatusBadge = (inv: InvoiceWithComputed) => {
    if (inv.is_overdue) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          <Clock className="h-3 w-3" />
          Overdue
        </span>
      )
    }

    switch (inv.status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </span>
        )
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
            <Send className="h-3 w-3" />
            Sent
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
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Invoices & Billing
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Manage client billing, configure itemized line items and tax rates, and monitor real-time
            payment statuses for your <strong className="text-foreground capitalize">{currentPersona.replace('_', ' ')}</strong> workspace.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="font-semibold shadow-sm shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Create Invoice
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
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Invoices
          </span>
          <p className="mt-1 text-2xl font-bold text-foreground">{invoices.length}</p>
          <span className="text-xs text-muted-foreground">Across all client accounts</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Paid Revenue
          </span>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${totalPaidRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-muted-foreground">Settled client payments</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Awaiting Payment
          </span>
          <p className="mt-1 text-2xl font-bold text-sky-600 dark:text-sky-400">
            ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-muted-foreground">Active sent invoices</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Overdue Balance
          </span>
          <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
            ${totalOverdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-muted-foreground">
            {overdueInvoices.length} {overdueInvoices.length === 1 ? 'invoice' : 'invoices'} past due
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'draft', 'sent', 'paid', 'overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filterStatus === tab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab === 'all' ? 'All Invoices' : tab}
              {tab === 'overdue' && overdueInvoices.length > 0 && (
                <span className="ml-1.5 rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px] text-rose-600 dark:text-rose-400">
                  {overdueInvoices.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search client or #ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        </div>
      </div>

      {/* Invoices Table / Empty State */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          /* Empty State when no invoices exist */
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
              <Receipt className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">No Invoices Created Yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
              Generate custom line-item invoices for clients, calculate automated tax rates, and monitor
              overdue payments.
            </p>
            <Button onClick={handleOpenCreate} size="sm" className="mt-4 font-semibold">
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Invoice
            </Button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          /* Empty State when filter or search returns 0 matches */
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-2">
              <Search className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">No matching invoices</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or status filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterStatus('all')
                setSearchQuery('')
              }}
              className="mt-3 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          /* Table of Invoices */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Computed Total</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((inv) => {
                  const invNum = getInvoiceNumber(inv.id)
                  const itemsCount = Array.isArray(inv.items) ? inv.items.length : 0

                  return (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      {/* Invoice Number: First 8 characters of id */}
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-foreground">
                            #{invNum}
                          </span>
                          <button
                            onClick={() => handleCopyInvoiceNumber(inv.id)}
                            title="Copy invoice number"
                            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                          >
                            {copiedId === inv.id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-5 py-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold uppercase">
                            {inv.client.charAt(0) || 'C'}
                          </div>
                          <span>{inv.client}</span>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-4 text-xs">
                        {inv.due_date ? (
                          <div
                            className={`flex items-center gap-1.5 font-medium ${
                              inv.is_overdue
                                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{inv.due_date}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic">No due date</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">{renderStatusBadge(inv)}</td>

                      {/* Line Items Count */}
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        <span className="rounded bg-muted px-2 py-0.5 font-medium">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      {/* Computed Total: sum(quantity * unit_price) * (1 + tax/100) */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-bold text-foreground">
                            ${inv.total.toFixed(2)}
                          </span>
                          {inv.tax > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              incl. {inv.tax}% tax
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEdit(inv)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit Invoice"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDelete(inv)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            title="Delete Invoice"
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

      {/* =========================================================================
          Create / Edit Dialog Modal
          ========================================================================= */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-foreground text-base">
                  {isEditOpen && selectedInvoice
                    ? `Edit Invoice #${getInvoiceNumber(selectedInvoice.id)}`
                    : 'Create New Invoice'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false)
                  setIsEditOpen(false)
                }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={isEditOpen ? handleUpdate : handleCreate} className="space-y-5">
              {/* Client & Due Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Studio, TechCorp"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
              </div>

              {/* Status & Tax Rate */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                  </select>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    (Overdue is derived automatically when past due date and not paid)
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                    value={tax}
                    onChange={(e) => setTax(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
              </div>

              {/* Line Items Editor */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Line Items
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleAddItem}
                    className="h-7 text-xs font-semibold gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const lineSubtotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-xl border border-border bg-muted/20 p-2.5"
                      >
                        <div className="flex-1 w-full sm:w-auto">
                          <input
                            type="text"
                            required
                            placeholder={`Description for item #${idx + 1}`}
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(idx, 'description', e.target.value)
                            }
                            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-ring focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="w-20">
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              required
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(idx, 'quantity', e.target.value)
                              }
                              className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs font-mono text-foreground focus:border-ring focus:outline-none"
                              title="Quantity"
                            />
                          </div>

                          <div className="w-24">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              required
                              placeholder="Price"
                              value={item.unit_price}
                              onChange={(e) =>
                                handleItemChange(idx, 'unit_price', e.target.value)
                              }
                              className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs font-mono text-foreground focus:border-ring focus:outline-none"
                              title="Unit Price ($)"
                            />
                          </div>

                          <div className="w-24 text-right font-mono text-xs font-semibold text-foreground">
                            ${lineSubtotal.toFixed(2)}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length <= 1}
                            className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Live Computed Total Breakdown */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Items Subtotal:</span>
                  <span className="font-mono font-medium text-foreground">
                    ${liveSubtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Tax ({tax}%):</span>
                  <span className="font-mono font-medium text-foreground">
                    +${liveTaxAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border text-sm">
                  <span className="font-bold text-foreground">Computed Total:</span>
                  <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                    ${liveTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setIsEditOpen(false)
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="font-semibold">
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  {isEditOpen ? 'Save Changes' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          Delete Confirmation Dialog Modal
          ========================================================================= */}
      {isDeleteOpen && invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">Delete Invoice</h3>
                <p className="text-xs text-muted-foreground">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Number:</span>
                <span className="font-mono font-bold text-foreground">
                  #{getInvoiceNumber(invoiceToDelete.id)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client:</span>
                <span className="font-semibold text-foreground">{invoiceToDelete.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-mono font-semibold text-foreground">
                  ${invoiceToDelete.total.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete invoice{' '}
              <strong className="text-foreground">#{getInvoiceNumber(invoiceToDelete.id)}</strong>{' '}
              for <strong className="text-foreground">{invoiceToDelete.client}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleteOpen(false)
                  setInvoiceToDelete(null)
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={submitting}
                className="font-semibold"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                Delete Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

