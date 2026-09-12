import { Database as DatabaseType } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/db';
import {
  CreateResourceDTO,
  IResource,
  PaginationMeta,
  ResourceQueryFilter,
  UpdateResourceDTO,
} from '../types/resource';

export class ResourceRepository {
  private get db(): DatabaseType {
    return getDatabase();
  }

  /**
   * Create a new resource in the database
   */
  public create(dto: CreateResourceDTO): IResource {
    const id = uuidv4();
    const now = new Date().toISOString();

    const resource: IResource = {
      id,
      title: dto.title,
      description: dto.description || null,
      category: dto.category.toLowerCase(),
      price: Number(dto.price),
      status: dto.status || 'active',
      stock: dto.stock !== undefined ? Number(dto.stock) : 0,
      createdAt: now,
      updatedAt: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO resources (id, title, description, category, price, status, stock, createdAt, updatedAt)
      VALUES (@id, @title, @description, @category, @price, @status, @stock, @createdAt, @updatedAt)
    `);

    stmt.run(resource);
    return resource;
  }

  /**
   * Find a resource by its unique ID
   */
  public findById(id: string): IResource | null {
    const stmt = this.db.prepare(`
      SELECT id, title, description, category, price, status, stock, createdAt, updatedAt
      FROM resources
      WHERE id = ?
    `);

    const result = stmt.get(id) as IResource | undefined;
    return result || null;
  }

  /**
   * List resources matching dynamic filters with pagination and sorting
   */
  public findAll(filters: ResourceQueryFilter): { items: IResource[]; meta: PaginationMeta } {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    // Filter by search keyword (title OR description)
    if (filters.search) {
      conditions.push('(title LIKE @search OR description LIKE @search)');
      params.search = `%${filters.search}%`;
    }

    // Filter by exact category (case-insensitive)
    if (filters.category) {
      conditions.push('LOWER(category) = LOWER(@category)');
      params.category = filters.category;
    }

    // Filter by exact status
    if (filters.status) {
      conditions.push('status = @status');
      params.status = filters.status;
    }

    // Price range filters
    if (filters.minPrice !== undefined) {
      conditions.push('price >= @minPrice');
      params.minPrice = filters.minPrice;
    }

    if (filters.maxPrice !== undefined) {
      conditions.push('price <= @maxPrice');
      params.maxPrice = filters.maxPrice;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total matching records count
    const countSql = `SELECT COUNT(*) as count FROM resources ${whereClause}`;
    const countStmt = this.db.prepare(countSql);
    const countResult = countStmt.get(params) as { count: number };
    const total = countResult ? countResult.count : 0;

    // Sorting columns whitelist
    const allowedSortColumns: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      price: 'price',
      title: 'title',
      stock: 'stock',
    };

    const sortBy = allowedSortColumns[filters.sortBy || 'createdAt'] || 'createdAt';
    const sortOrder = (filters.sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Data query with LIMIT and OFFSET
    const dataSql = `
      SELECT id, title, description, category, price, status, stock, createdAt, updatedAt
      FROM resources
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT @limit OFFSET @offset
    `;

    const dataStmt = this.db.prepare(dataSql);
    const items = dataStmt.all({ ...params, limit, offset }) as IResource[];

    const totalPages = Math.ceil(total / limit) || 1;

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return { items, meta };
  }

  /**
   * Update an existing resource
   */
  public update(id: string, dto: UpdateResourceDTO): IResource | null {
    const existing = this.findById(id);
    if (!existing) {
      return null;
    }

    const updates: string[] = [];
    const params: Record<string, unknown> = { id };

    if (dto.title !== undefined) {
      updates.push('title = @title');
      params.title = dto.title;
    }
    if (dto.description !== undefined) {
      updates.push('description = @description');
      params.description = dto.description;
    }
    if (dto.category !== undefined) {
      updates.push('category = @category');
      params.category = dto.category.toLowerCase();
    }
    if (dto.price !== undefined) {
      updates.push('price = @price');
      params.price = Number(dto.price);
    }
    if (dto.status !== undefined) {
      updates.push('status = @status');
      params.status = dto.status;
    }
    if (dto.stock !== undefined) {
      updates.push('stock = @stock');
      params.stock = Number(dto.stock);
    }

    const now = new Date().toISOString();
    updates.push('updatedAt = @updatedAt');
    params.updatedAt = now;

    const updateSql = `
      UPDATE resources
      SET ${updates.join(', ')}
      WHERE id = @id
    `;

    this.db.prepare(updateSql).run(params);
    return this.findById(id);
  }

  /**
   * Delete a resource by ID
   */
  public delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM resources WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const resourceRepository = new ResourceRepository();
