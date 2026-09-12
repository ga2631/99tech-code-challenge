import { Router } from 'express';
import { resourceController } from '../controllers/resourceController';
import {
  createResourceSchema,
  queryResourceSchema,
  resourceIdParamSchema,
  updateResourceSchema,
  validate,
} from '../validators/resourceValidator';

const router = Router();

/**
 * @route   POST /api/v1/resources
 * @desc    Create a new resource
 */
router.post(
  '/',
  validate(createResourceSchema, 'body'),
  resourceController.create
);

/**
 * @route   GET /api/v1/resources
 * @desc    List resources with filters, pagination, and sorting
 */
router.get(
  '/',
  validate(queryResourceSchema, 'query'),
  resourceController.list
);

/**
 * @route   GET /api/v1/resources/:id
 * @desc    Get resource details by ID
 */
router.get(
  '/:id',
  validate(resourceIdParamSchema, 'params'),
  resourceController.getById
);

/**
 * @route   PUT /api/v1/resources/:id
 * @desc    Update resource details
 */
router.put(
  '/:id',
  validate(resourceIdParamSchema, 'params'),
  validate(updateResourceSchema, 'body'),
  resourceController.update
);

/**
 * @route   PATCH /api/v1/resources/:id
 * @desc    Partial update resource details
 */
router.patch(
  '/:id',
  validate(resourceIdParamSchema, 'params'),
  validate(updateResourceSchema, 'body'),
  resourceController.update
);

/**
 * @route   DELETE /api/v1/resources/:id
 * @desc    Delete a resource
 */
router.delete(
  '/:id',
  validate(resourceIdParamSchema, 'params'),
  resourceController.delete
);

export default router;
