import { v4 as uuidv4 } from 'uuid';
import { getDatabase, closeDatabase } from './db';

export function seedData(): void {
  const db = getDatabase();

  console.log('🌱 Seeding sample resources into database...');

  const sampleResources = [
    {
      id: uuidv4(),
      title: 'Mechanical Gaming Keyboard',
      description: 'RGB Backlit, hot-swappable tactile switches, USB-C',
      category: 'electronics',
      price: 89.99,
      status: 'active',
      stock: 45,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Ergonomic Office Chair',
      description: 'Breathable mesh, lumbar support, 3D adjustable armrests',
      category: 'furniture',
      price: 249.5,
      status: 'active',
      stock: 12,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Ultra-Wide 4K Monitor 34"',
      description: '144Hz refresh rate, 1ms response time, HDR400',
      category: 'electronics',
      price: 499.0,
      status: 'active',
      stock: 8,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: uuidv4(),
      title: 'TypeScript in Action (Hardcover)',
      description: 'Master advanced TypeScript patterns and system architectures',
      category: 'books',
      price: 39.95,
      status: 'active',
      stock: 100,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Noise-Cancelling Wireless Headphones',
      description: 'Active Noise Cancellation with 40-hour battery life',
      category: 'electronics',
      price: 179.99,
      status: 'draft',
      stock: 0,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Vintage Leather Notebook',
      description: 'Handcrafted genuine leather journal with 240 lined pages',
      category: 'stationery',
      price: 24.0,
      status: 'archived',
      stock: 0,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ];

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO resources (id, title, description, category, price, status, stock, createdAt, updatedAt)
    VALUES (@id, @title, @description, @category, @price, @status, @stock, @createdAt, @updatedAt)
  `);

  const insertMany = db.transaction((resources) => {
    for (const res of resources) {
      insertStmt.run(res);
    }
  });

  insertMany(sampleResources);

  console.log(`✅ Successfully seeded ${sampleResources.length} sample resources.`);
}

if (require.main === module) {
  seedData();
  closeDatabase();
}
