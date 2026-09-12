import request from 'supertest';
import { createApp } from '../src/app';
import { closeDatabase, getDatabase } from '../src/database/db';

describe('Resource CRUD API Integration Tests', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    // Set test environment and use in-memory SQLite database
    process.env.NODE_ENV = 'test';
    process.env.DB_PATH = ':memory:';
    getDatabase(':memory:');
    app = createApp();
  });

  afterAll(() => {
    closeDatabase();
  });

  describe('GET /health', () => {
    it('should return server status UP', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('POST /api/v1/resources (Create)', () => {
    it('should create a new resource with valid payload', async () => {
      const payload = {
        title: 'Wireless Gaming Mouse',
        description: '26000 DPI sensor, ultra-lightweight 58g',
        category: 'electronics',
        price: 79.99,
        status: 'active',
        stock: 30,
      };

      const res = await request(app).post('/api/v1/resources').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        title: payload.title,
        description: payload.description,
        category: 'electronics',
        price: 79.99,
        status: 'active',
        stock: 30,
      });
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    it('should reject creation when title is missing', async () => {
      const invalidPayload = {
        category: 'electronics',
        price: 49.99,
      };

      const res = await request(app).post('/api/v1/resources').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject creation when price is negative', async () => {
      const invalidPayload = {
        title: 'Invalid Price Item',
        category: 'electronics',
        price: -10,
      };

      const res = await request(app).post('/api/v1/resources').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject creation when status is invalid', async () => {
      const invalidPayload = {
        title: 'Invalid Status Item',
        category: 'books',
        price: 19.99,
        status: 'non_existent_status',
      };

      const res = await request(app).post('/api/v1/resources').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/resources (List & Filter)', () => {
    beforeAll(async () => {
      // Seed specific test fixtures
      const fixtures = [
        {
          title: 'MacBook Pro 16"',
          description: 'Apple M3 Max, 36GB RAM',
          category: 'electronics',
          price: 2499.0,
          status: 'active',
          stock: 5,
        },
        {
          title: 'Clean Code Book',
          description: 'A Handbook of Agile Software Craftsmanship',
          category: 'books',
          price: 32.5,
          status: 'active',
          stock: 50,
        },
        {
          title: 'Design Patterns Elements of Reusable Object-Oriented Software',
          description: 'Gang of Four classic software engineering book',
          category: 'books',
          price: 45.0,
          status: 'draft',
          stock: 0,
        },
        {
          title: 'Standing Desk',
          description: 'Dual-motor electric height adjustable desk',
          category: 'furniture',
          price: 399.0,
          status: 'archived',
          stock: 2,
        },
      ];

      for (const item of fixtures) {
        await request(app).post('/api/v1/resources').send(item);
      }
    });

    it('should list all resources with pagination metadata', async () => {
      const res = await request(app).get('/api/v1/resources');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page', 1);
      expect(res.body.meta).toHaveProperty('limit', 10);
      expect(res.body.meta).toHaveProperty('totalPages');
    });

    it('should filter resources by category', async () => {
      const res = await request(app).get('/api/v1/resources?category=books');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.every((r: any) => r.category === 'books')).toBe(true);
    });

    it('should filter resources by status', async () => {
      const res = await request(app).get('/api/v1/resources?status=draft');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((r: any) => r.status === 'draft')).toBe(true);
    });

    it('should filter resources by search keyword across title or description', async () => {
      const res = await request(app).get('/api/v1/resources?search=Craftsmanship');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Clean Code Book');
    });

    it('should filter resources by price range (minPrice & maxPrice)', async () => {
      const res = await request(app).get('/api/v1/resources?minPrice=30&maxPrice=50');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((r: any) => r.price >= 30 && r.price <= 50)).toBe(true);
    });

    it('should sort resources by price in ascending order', async () => {
      const res = await request(app).get('/api/v1/resources?sortBy=price&sortOrder=asc');

      expect(res.status).toBe(200);
      const prices = res.body.data.map((r: any) => r.price);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });

    it('should paginate results properly', async () => {
      const res = await request(app).get('/api/v1/resources?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.meta.hasNextPage).toBe(true);
    });
  });

  describe('GET /api/v1/resources/:id (Details)', () => {
    let createdId: string;

    beforeAll(async () => {
      const res = await request(app).post('/api/v1/resources').send({
        title: 'Detail Test Resource',
        category: 'gadgets',
        price: 15.0,
      });
      createdId = res.body.data.id;
    });

    it('should return resource details for an existing ID', async () => {
      const res = await request(app).get(`/api/v1/resources/${createdId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdId);
      expect(res.body.data.title).toBe('Detail Test Resource');
    });

    it('should return 404 for a non-existent ID', async () => {
      const res = await request(app).get('/api/v1/resources/non-existent-uuid-999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT & PATCH /api/v1/resources/:id (Update)', () => {
    let targetId: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/v1/resources').send({
        title: 'Original Title',
        description: 'Original Description',
        category: 'general',
        price: 100.0,
        status: 'draft',
        stock: 10,
      });
      targetId = res.body.data.id;
    });

    it('should update resource fields via PUT', async () => {
      const updatePayload = {
        title: 'Updated Title',
        price: 120.0,
        status: 'active',
      };

      const res = await request(app).put(`/api/v1/resources/${targetId}`).send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.price).toBe(120.0);
      expect(res.body.data.status).toBe('active');
      expect(res.body.data.description).toBe('Original Description'); // preserved
    });

    it('should reject update if payload is empty', async () => {
      const res = await request(app).put(`/api/v1/resources/${targetId}`).send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when updating a non-existent resource', async () => {
      const res = await request(app).put('/api/v1/resources/unknown-id-000').send({
        title: 'Cannot Update',
      });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/resources/:id (Delete)', () => {
    let targetId: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/v1/resources').send({
        title: 'Item to Delete',
        category: 'temporary',
        price: 5.0,
      });
      targetId = res.body.data.id;
    });

    it('should delete an existing resource', async () => {
      const deleteRes = await request(app).delete(`/api/v1/resources/${targetId}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verify subsequent GET returns 404
      const getRes = await request(app).get(`/api/v1/resources/${targetId}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 when attempting to delete a non-existent resource', async () => {
      const res = await request(app).delete('/api/v1/resources/already-deleted-or-missing');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Error Handling & Boundary Cases', () => {
    it('should return 404 for unrecognized routes', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
    });
  });
});
