import { Request, Response, NextFunction } from 'express';
import { resourceService, ResourceService } from '../services/resourceService';
import { ApiResponse, CreateResourceDTO, IResource, UpdateResourceDTO } from '../types/resource';

export class ResourceController {
  constructor(private readonly service: ResourceService = resourceService) {}

  /**
   * POST /api/v1/resources
   * Create a new resource
   */
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateResourceDTO = req.body;
      const resource = this.service.createResource(dto);

      const response: ApiResponse<IResource> = {
        success: true,
        data: resource,
        message: 'Resource created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/resources
   * List resources with basic filters, pagination, and sorting
   */
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { items, meta } = this.service.listResources(req.query as any);

      const response: ApiResponse<IResource[]> = {
        success: true,
        data: items,
        meta,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/resources/:id
   * Get resource details by ID
   */
  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const resource = this.service.getResourceById(id);

      const response: ApiResponse<IResource> = {
        success: true,
        data: resource,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/resources/:id
   * Update resource details
   */
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const dto: UpdateResourceDTO = req.body;
      const updated = this.service.updateResource(id, dto);

      const response: ApiResponse<IResource> = {
        success: true,
        data: updated,
        message: 'Resource updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/resources/:id
   * Delete a resource
   */
  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      this.service.deleteResource(id);

      const response: ApiResponse<null> = {
        success: true,
        message: `Resource with ID '${id}' deleted successfully`,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export const resourceController = new ResourceController();
