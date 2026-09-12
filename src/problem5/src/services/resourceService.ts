import {
  CreateResourceDTO,
  IResource,
  PaginationMeta,
  ResourceQueryFilter,
  UpdateResourceDTO,
} from '../types/resource';
import { ResourceRepository, resourceRepository } from '../repositories/resourceRepository';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class ResourceService {
  constructor(private readonly repo: ResourceRepository = resourceRepository) {}

  public createResource(dto: CreateResourceDTO): IResource {
    return this.repo.create(dto);
  }

  public getResourceById(id: string): IResource {
    const resource = this.repo.findById(id);
    if (!resource) {
      throw new NotFoundError(`Resource with ID '${id}' not found`);
    }
    return resource;
  }

  public listResources(filters: ResourceQueryFilter): { items: IResource[]; meta: PaginationMeta } {
    return this.repo.findAll(filters);
  }

  public updateResource(id: string, dto: UpdateResourceDTO): IResource {
    const updated = this.repo.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Resource with ID '${id}' not found`);
    }
    return updated;
  }

  public deleteResource(id: string): void {
    const deleted = this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Resource with ID '${id}' not found`);
    }
  }
}

export const resourceService = new ResourceService();
