import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const createResourceSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must not exceed 255 characters'),
  description: z.string().trim().max(2000, 'Description must not exceed 2000 characters').nullable().optional(),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category cannot be empty')
    .max(100, 'Category must not exceed 100 characters'),
  price: z
    .number({ required_error: 'Price is required' })
    .nonnegative('Price must be greater than or equal to 0'),
  status: z.enum(['draft', 'active', 'archived']).default('active').optional(),
  stock: z
    .number()
    .int('Stock must be an integer')
    .nonnegative('Stock must be greater than or equal to 0')
    .default(0)
    .optional(),
});

export const updateResourceSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(255, 'Title must not exceed 255 characters')
      .optional(),
    description: z.string().trim().max(2000, 'Description must not exceed 2000 characters').nullable().optional(),
    category: z
      .string()
      .trim()
      .min(1, 'Category cannot be empty')
      .max(100, 'Category must not exceed 100 characters')
      .optional(),
    price: z.number().nonnegative('Price must be greater than or equal to 0').optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    stock: z.number().int('Stock must be an integer').nonnegative('Stock must be greater than or equal to 0').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const queryResourceSchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), {
      message: 'minPrice must be a non-negative number',
    }),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), {
      message: 'maxPrice must be a non-negative number',
    }),
  sortBy: z.enum(['createdAt', 'updatedAt', 'price', 'title', 'stock']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : 1))
    .refine((val) => val >= 1, { message: 'page must be greater than or equal to 1' }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : 10))
    .refine((val) => val >= 1 && val <= 100, { message: 'limit must be between 1 and 100' }),
});

export const resourceIdParamSchema = z.object({
  id: z.string().trim().min(1, 'Resource ID is required'),
});

/**
 * Higher-order middleware function to validate incoming request parts using Zod schemas
 */
export function validate(schema: z.ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
}
