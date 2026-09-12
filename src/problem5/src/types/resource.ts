/**
 * Resource Model & DTO Definitions
 */

export type ResourceStatus = 'draft' | 'active' | 'archived';

export interface IResource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  status: ResourceStatus;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceDTO {
  title: string;
  description?: string | null;
  category: string;
  price: number;
  status?: ResourceStatus;
  stock?: number;
}

export interface UpdateResourceDTO {
  title?: string;
  description?: string | null;
  category?: string;
  price?: number;
  status?: ResourceStatus;
  stock?: number;
}

export interface ResourceQueryFilter {
  search?: string;
  category?: string;
  status?: ResourceStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'price' | 'title' | 'stock';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  error?: {
    code: string;
    details?: unknown;
  };
}
