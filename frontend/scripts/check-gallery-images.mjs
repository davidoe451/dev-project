import assert from 'node:assert/strict';
import { MAX_IMAGE_BYTES, validateGalleryFile } from '../src/app/features/admin/components/product-image-picker/gallery-image.utils.ts';

const photo = { name: 'photo.jpg', type: 'image/jpeg', size: 1024 };
for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
  assert.equal(validateGalleryFile({ ...photo, type }, 0), null);
}
assert.equal(validateGalleryFile({ ...photo, size: MAX_IMAGE_BYTES }, 7), null);
assert.match(validateGalleryFile({ ...photo, type: 'image/svg+xml' }, 0), /JPEG, PNG or WebP/);
assert.match(validateGalleryFile({ ...photo, type: 'application/pdf' }, 0), /JPEG, PNG or WebP/);
assert.match(validateGalleryFile({ ...photo, size: 0 }, 0), /5 MB/);
assert.match(validateGalleryFile({ ...photo, size: MAX_IMAGE_BYTES + 1 }, 0), /5 MB/);
assert.match(validateGalleryFile(photo, 8), /Maximum 8/);
console.log('Gallery file validation checks passed.');
