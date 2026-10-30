import { z } from 'zod'

export type InvoiceStatus = 'draft' | 'sent' | 'paid'
export type DerivedInvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
}

export interface Invoice {
  id: string
  user_id: string
  client: string
  items: InvoiceItem[]
  tax: number
  status: InvoiceStatus
  due_date: string | null
  pdf_path: string | null
  created_at?: string
}

export interface InvoiceWithComputed extends Invoice {
  total: number
  subtotal: number
  tax_amount: number
  is_overdue: boolean
  derived_status: DerivedInvoiceStatus
  invoice_number: string
}

// -----------------------------------------------------------------------------
// Validation Schemas (Zod)
// -----------------------------------------------------------------------------

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, 'Item description is required'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unit_price: z.coerce.number().min(0, 'Unit price must be non-negative'),
})

export const createInvoiceSchema = z.object({
  client: z.string().trim().min(1, 'Client name is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  tax: z.coerce
    .number()
    .min(0, 'Tax must be at least 0%')
    .max(100, 'Tax cannot exceed 100%')
    .default(0),
  status: z.enum(['draft', 'sent', 'paid']).default('draft'),
  due_date: z
    .preprocess(
      (val) => (val === '' ? null : val),
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
        .nullable()
        .optional()
    ),
  pdf_path: z.string().nullable().optional(),
})

export const updateInvoiceSchema = z.object({
  client: z.string().trim().min(1, 'Client name is required').optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required').optional(),
  tax: z.coerce
    .number()
    .min(0, 'Tax must be at least 0%')
    .max(100, 'Tax cannot exceed 100%')
    .optional(),
  status: z.enum(['draft', 'sent', 'paid']).optional(),
  due_date: z
    .preprocess(
      (val) => (val === '' ? null : val),
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
        .nullable()
        .optional()
    ),
  pdf_path: z.string().nullable().optional(),
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>

// -----------------------------------------------------------------------------
// Pure Calculation Helpers
// Note: Total and Overdue are computed here and NEVER stored in the database.
// -----------------------------------------------------------------------------

/**
 * Calculates line item amount: quantity * unit_price
 */
export function computeItemTotal(item: InvoiceItem): number {
  const qty = Number(item?.quantity) || 0
  const price = Number(item?.unit_price) || 0
  return Math.round(qty * price * 100) / 100
}

/**
 * Calculates the raw subtotal of all items: sum(quantity * unit_price)
 */
export function computeSubtotal(items: InvoiceItem[] | null | undefined): number {
  if (!Array.isArray(items)) return 0
  const sum = items.reduce((acc, item) => {
    const qty = Number(item?.quantity) || 0
    const price = Number(item?.unit_price) || 0
    return acc + qty * price
  }, 0)
  return Math.round(sum * 100) / 100
}

/**
 * Calculates tax amount: subtotal * (tax / 100)
 */
export function computeTaxAmount(
  items: InvoiceItem[] | null | undefined,
  tax: number | string | null | undefined
): number {
  const subtotal = computeSubtotal(items)
  const taxPct = Number(tax) || 0
  return Math.round(subtotal * (taxPct / 100) * 100) / 100
}

/**
 * Total = sum(quantity * unit_price) * (1 + tax/100)
 * tax is a percentage (0-100).
 * Never stored in the database.
 */
export function computeTotal(
  items: InvoiceItem[] | null | undefined,
  tax: number | string | null | undefined
): number {
  const subtotal = computeSubtotal(items)
  const taxPct = Number(tax) || 0
  const total = subtotal * (1 + taxPct / 100)
  return Math.round(total * 100) / 100
}

/**
 * "Overdue" is derived from due_date < today and status != paid, never stored.
 */
export function isInvoiceOverdue(invoice: {
  due_date?: string | null
  status?: string | null
}): boolean {
  if (!invoice.due_date) return false
  if (invoice.status === 'paid') return false

  const parts = invoice.due_date.split('-').map(Number)
  if (parts.length !== 3) return false
  const [year, month, day] = parts
  if (!year || !month || !day) return false

  const dueDate = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return dueDate.getTime() < today.getTime()
}

/**
 * Returns the derived status of an invoice:
 * 'overdue' if due_date < today and status != 'paid'
 * otherwise returns stored status ('draft' | 'sent' | 'paid')
 */
export function getDerivedStatus(invoice: {
  due_date?: string | null
  status?: string | null
}): DerivedInvoiceStatus {
  if (isInvoiceOverdue(invoice)) {
    return 'overdue'
  }
  const s = (invoice.status || 'draft').toLowerCase()
  if (s === 'paid') return 'paid'
  if (s === 'sent') return 'sent'
  return 'draft'
}

/**
 * Show the invoice number as the first 8 characters of the id.
 */
export function getInvoiceNumber(id: string): string {
  if (!id) return ''
  return id.slice(0, 8)
}

/**
 * Enrich an invoice record with calculated and derived properties.
 */
export function withComputedInvoice(invoice: Invoice): InvoiceWithComputed {
  const subtotal = computeSubtotal(invoice.items)
  const total = computeTotal(invoice.items, invoice.tax)
  const tax_amount = computeTaxAmount(invoice.items, invoice.tax)
  const is_overdue = isInvoiceOverdue(invoice)
  const derived_status = getDerivedStatus(invoice)
  const invoice_number = getInvoiceNumber(invoice.id)

  return {
    ...invoice,
    subtotal,
    total,
    tax_amount,
    is_overdue,
    derived_status,
    invoice_number,
  }
}

/**
 * Available to product_creator and freelancer personas only.
 */
export function isInvoicePersonaAllowed(persona: string | null | undefined): boolean {
  return persona === 'product_creator' || persona === 'freelancer'
}

