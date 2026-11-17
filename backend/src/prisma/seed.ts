import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/prisma/client.js';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Roles
  const roles = [
    { code: 'ADMIN', name: 'Admin' },
    { code: 'CUSTOMER', name: 'Customer' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }
  console.log('Roles seeded');

  // 2. Admin User
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { code: 'ADMIN' } });
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      email: 'admin@store.com',
      password: hashedPassword,
      fullName: 'Store Admin',
      phone: '0123456789',
      isActive: true,
      roleId: adminRole.id,
    },
  });
  console.log('Admin user seeded (admin@store.com / Admin@123456)');

  // 3. Categories
  const categories = [
    { name: 'Men', slug: 'men' },
    { name: 'Women', slug: 'women' },
    { name: 'Accessories', slug: 'accessories' },
  ];

  const categoryMap = new Map<string, number>();
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log('Categories seeded');

  // 4. Brands
  const brands = [
    { name: 'Nike', slug: 'nike' },
    { name: 'Adidas', slug: 'adidas' },
    { name: 'Zara', slug: 'zara' },
    { name: 'Uniqlo', slug: 'uniqlo' },
  ];

  const brandMap = new Map<string, number>();
  for (const b of brands) {
    const record = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brandMap.set(b.slug, record.id);
  }
  console.log('Brands seeded');

  // 5. Products, Variants & Images
  const sampleProducts = [
    {
      name: 'Classic Cotton Crewneck T-Shirt',
      slug: 'classic-cotton-crewneck-tshirt',
      description: 'Comfortable everyday 100% cotton crewneck t-shirt.',
      price: 19.99,
      categorySlug: 'men',
      brandSlug: 'uniqlo',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
      variants: [
        { sku: 'TS-MEN-WHT-S', size: 'S', color: 'White', stock: 25 },
        { sku: 'TS-MEN-WHT-M', size: 'M', color: 'White', stock: 40 },
        { sku: 'TS-MEN-WHT-L', size: 'L', color: 'White', stock: 30 },
        { sku: 'TS-MEN-BLK-M', size: 'M', color: 'Black', stock: 15 },
        { sku: 'TS-MEN-BLK-L', size: 'L', color: 'Black', stock: 20 },
      ],
    },
    {
      name: 'Slim Fit Denim Jeans',
      slug: 'slim-fit-denim-jeans',
      description: 'Modern slim fit stretch denim jeans for all-day comfort.',
      price: 49.99,
      categorySlug: 'men',
      brandSlug: 'zara',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      variants: [
        { sku: 'JN-SLM-BLU-S', size: 'S', color: 'Blue', stock: 12 },
        { sku: 'JN-SLM-BLU-M', size: 'M', color: 'Blue', stock: 18 },
        { sku: 'JN-SLM-BLU-L', size: 'L', color: 'Blue', stock: 8 },
      ],
    },
    {
      name: 'Oversized Fleece Hoodie',
      slug: 'oversized-fleece-hoodie',
      description: 'Cozy oversized fleece pullover hoodie with kangaroo pocket.',
      price: 59.99,
      categorySlug: 'women',
      brandSlug: 'nike',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
      variants: [
        { sku: 'HD-OVS-GRY-M', size: 'M', color: 'Grey', stock: 20 },
        { sku: 'HD-OVS-GRY-L', size: 'L', color: 'Grey', stock: 15 },
        { sku: 'HD-OVS-BLK-M', size: 'M', color: 'Black', stock: 10 },
      ],
    },
  ];

  for (const item of sampleProducts) {
    const categoryId = categoryMap.get(item.categorySlug)!;
    const brandId = brandMap.get(item.brandSlug)!;

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: { price: item.price },
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        categoryId,
        brandId,
        isActive: true,
      },
    });

    // Seed variants
    for (const v of item.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: { stock: v.stock },
        create: {
          productId: product.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock: v.stock,
          isActive: true,
        },
      });
    }

    // Seed primary image
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id },
    });
    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: item.imageUrl,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }
  }

  console.log('Sample products, variants, and images seeded');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
