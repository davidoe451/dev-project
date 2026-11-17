export const SIZE = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'] as const;
export type Size = (typeof SIZE)[number];