export const MAX_PRODUCT_IMAGES = 8;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateGalleryFile(file: Pick<File, 'name' | 'type' | 'size'>, imageCount: number): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return `${file.name}: choose JPEG, PNG or WebP.`;
  }
  if (file.size > MAX_IMAGE_BYTES || file.size === 0) {
    return `${file.name}: image must be between 1 byte and 5 MB.`;
  }
  return imageCount >= MAX_PRODUCT_IMAGES ? 'Maximum 8 images per product.' : null;
}
