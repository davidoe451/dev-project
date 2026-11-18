import assert from 'node:assert/strict';
import { mapCatalogList, mapCatalogProduct } from '../src/app/core/models/catalog-api.mapper.ts';

const product = {
  id: 12, name: 'Test coat', slug: 'test-coat', description: 'Warm coat', price: '100.00',
  isActive: true, createdAt: '2026-11-18T00:00:00.000Z',
  category: { id: 2, name: 'Coats', slug: 'coats' },
  brand: { id: 3, name: 'Test brand', slug: 'test-brand' },
  images: [{ id: 4, url: '/product-images/coat.jpg', isPrimary: true, sortOrder: 0 }],
  variants: [{ id: 5, sku: 'COAT-BLK-M', size: 'M', color: 'Black', price: '110.00', stock: 4 }],
};

const mapped = mapCatalogProduct(product, 'http://localhost:3000');
assert.equal(mapped.slug, 'test-coat');
assert.equal(mapped.basePrice, 100);
assert.equal(mapped.variants[0].price, 110);
assert.equal(mapped.variants[0].stock, 4);
assert.equal(mapped.images[0].url, 'http://localhost:3000/product-images/coat.jpg');
assert.equal(mapped.images[0].isPrimary, true);

const list = mapCatalogList({ items: [product], meta: { total: 21, page: 2, limit: 10, totalPages: 3 } }, 'http://localhost:3000');
assert.deepEqual({ total: list.total, page: list.page, totalPages: list.totalPages }, { total: 21, page: 2, totalPages: 3 });
assert.deepEqual(list.availableSizes, ['M']);
assert.throws(() => mapCatalogProduct({ ...product, images: undefined }, 'http://localhost:3000'));
console.log('Sprint 2 catalog contract checks passed.');
