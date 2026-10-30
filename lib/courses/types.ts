import { z } from 'zod'

export type CourseStatus = 'draft' | 'published' | 'archived' | 'listed' | 'paused'

export interface Course {
  id: string
  user_id: string
  title: string
  price: number
  category: string | null
  status: CourseStatus | string | null
  sales: number
  created_at: string
}

export const createCourseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  price: z.coerce.number().min(0, 'Price must be 0 or positive'),
  category: z.string().trim().max(100).optional().default('General'),
  status: z.enum(['draft', 'published', 'archived', 'listed', 'paused']).default('draft'),
})

export const updateCourseSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  price: z.coerce.number().min(0).optional(),
  category: z.string().trim().max(100).optional(),
  status: z.enum(['draft', 'published', 'archived', 'listed', 'paused']).optional(),
  sales: z.coerce.number().int().min(0).optional(),
  increment_sales: z.coerce.number().int().min(1).optional(),
  add_to_earnings: z.boolean().optional(),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
