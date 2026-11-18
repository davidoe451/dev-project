import { describe, expect, it, vi } from 'vitest';
import { ProductService } from './product.service.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import type { StorageService } from '../storage/storage.service.js';

const product = {
  id: 12, name: 'Test coat', slug: 'test-coat', description: 'Warm coat', price: 100,
  isActive: true, createdAt: new Date('2026-11-18T00:00:00.000Z'),
  category: { id: 2, name: 'Coats', slug: 'coats' },
  brand: { id: 3, name: 'Test brand', slug: 'test-brand' },
  images: [{ id: 4, url: '/product-images/coat.jpg', isPrimary: true, sortOrder: 0 }],
  variants: [{ id: 5, sku: 'COAT-BLK-M', size: 'M', color: 'Black', price: null, stock: 4 }],
};

function createService() {
  const prisma = {
    product: {
      findMany: vi.fn().mockResolvedValue([product]),
      count: vi.fn().mockResolvedValue(1),
      findFirst: vi.fn().mockResolvedValue(product),
    },
    $transaction: vi.fn((queries: Promise<unknown>[]) => Promise.all(queries)),
  };
  return { service: new ProductService(prisma as unknown as PrismaService, {} as StorageService), prisma };
}

describe('Sprint 2 product contract', () => {
  it('filters by slugs and returns complete gallery and variants', async () => {
    const { service, prisma } = createService();
    const result = await service.findAll({ category: 'coats', brand: 'test-brand', size: 'M', inStockOnly: true });
    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        category: { slug: 'coats' }, brand: { slug: 'test-brand' },
        variants: { some: { size: 'M', isActive: true, stock: { gt: 0 } } },
      }),
    }));
    expect(result.items[0].images).toHaveLength(1);
    expect(result.items[0].variants[0]).toMatchObject({ sku: 'COAT-BLK-M', price: 100, stock: 4 });
    expect(result.meta.total).toBe(1);
  });

  it('loads product details by slug or numeric ID', async () => {
    const { service, prisma } = createService();
    expect((await service.findOne('test-coat')).variants[0].price).toBe(100);
    expect(prisma.product.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { slug: 'test-coat', isActive: true } }));
    await service.findOne('12');
    expect(prisma.product.findFirst).toHaveBeenLastCalledWith(expect.objectContaining({ where: { id: 12, isActive: true } }));
  });
});
