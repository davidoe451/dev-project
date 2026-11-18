import assert from 'node:assert/strict';
import { mapAdminCategories, mapAdminProduct, mapAdminProducts, unwrapResponse } from '../src/app/core/models/product-api.mapper.ts';
import { mapAdminUser } from '../src/app/features/admin/services/admin-user.mapper.ts';

const product = {
  id: 12, name: 'Test coat', slug: 'test-coat', basePrice: 100, categoryId: 2,
  category: { id: 2, name: 'Coats', slug: 'coats' }, brand: { id: 3, name: 'Test brand' },
  variants: [{ size: 'M', stock: 4 }, { size: 'M', stock: 2 }, { size: 'L', stock: 0 }],
  images: [{ url: 'https://example.com/detail.jpg', isPrimary: false, sortOrder: 0 }, { url: 'https://example.com/cover.jpg', isPrimary: true, sortOrder: 1 }],
  isActive: true, createdAt: '2026-11-16T00:00:00.000Z',
};
const mapped = mapAdminProduct(product);
assert.equal(mapped.id, '12');
assert.equal(mapped.category.id, '2');
assert.equal(mapped.stock, 6);
assert.equal(mapped.brand, 'Test brand');
assert.equal(mapped.sizes, 'M,L');
assert.equal(mapped.images.split(',')[0], 'https://example.com/cover.jpg');
assert.equal(product.images[0].isPrimary, false, 'Mapping must not reorder the source gallery');

const flatList = { items: [product], total: 15, page: 2, limit: 5, totalPages: 3 };
assert.deepEqual(mapAdminProducts(unwrapResponse(flatList)).meta, { total: 15, page: 2, limit: 5, totalPages: 3 });
assert.deepEqual(mapAdminProducts(unwrapResponse({ data: flatList })), mapAdminProducts(flatList));
assert.deepEqual(mapAdminProducts({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 }).items, []);
assert.equal(mapAdminCategories([{ id: 2, name: 'Coats', slug: 'coats' }])[0].id, '2');

const user = { id: 7, email: 'test@example.com', isActive: false, role: { id: 2, code: 'CUSTOMER', name: 'Customer' } };
assert.equal(mapAdminUser(user).status, 'INACTIVE');
assert.equal(mapAdminUser({ ...user, isActive: true }).status, 'ACTIVE');
assert.equal(mapAdminUser({ ...user, status: 'BLOCKED' }).status, 'BLOCKED');
assert.equal(mapAdminUser(user).id, '7');

if (process.argv.includes('--live')) {
  const baseUrl = process.env.ADMIN_API_BASE_URL ?? 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/products?page=1&limit=2`);
  assert.equal(response.status, 200);
  const products = mapAdminProducts(unwrapResponse(await response.json()));
  assert.ok(products.items.length > 0);
  assert.ok(products.meta.total >= products.items.length);
  const categoriesResponse = await fetch(`${baseUrl}/categories`);
  assert.equal(categoriesResponse.status, 200);
  const categories = mapAdminCategories(unwrapResponse(await categoriesResponse.json()));
  assert.ok(categories.length > 0);
  console.log(`Live API: ${products.items.length} products mapped; total=${products.meta.total}, categories=${categories.length}.`);
}
console.log('Admin response contract checks passed.');
