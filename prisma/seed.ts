import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'Administrator',
    },
  });

  const customerRole = await prisma.role.upsert({
    where: { code: 'CUSTOMER' },
    update: {},
    create: {
      code: 'CUSTOMER',
      name: 'Customer',
    },
  });

  console.log('✅ Roles initialized (ADMIN, CUSTOMER)');

  // 2. Default Users
  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@clothingstore.com' },
    update: {},
    create: {
      email: 'admin@clothingstore.com',
      password: passwordHash,
      fullName: 'Store Administrator',
      phone: '0901234567',
      roleId: adminRole.id,
    },
  });

  const demoCustomer = await prisma.user.upsert({
    where: { email: 'customer@clothingstore.com' },
    update: {},
    create: {
      email: 'customer@clothingstore.com',
      password: customerPasswordHash,
      fullName: 'Demo Customer',
      phone: '0987654321',
      roleId: customerRole.id,
    },
  });

  console.log('✅ Default users created:');
  console.log('   - Admin: admin@clothingstore.com / Admin@123456');
  console.log('   - Customer: customer@clothingstore.com / Customer@123456');

  // 3. Categories
  const categories = [
    { name: 'T-Shirts', slug: 't-shirts', description: 'Comfortable everyday casual t-shirts' },
    { name: 'Jeans & Denim', slug: 'jeans-denim', description: 'Classic slim and regular fit jeans' },
    { name: 'Jackets & Coats', slug: 'jackets-coats', description: 'Warm outerwear and street jackets' },
    { name: 'Hoodies & Sweatshirts', slug: 'hoodies', description: 'Cozy cotton hoodies for cold days' },
  ];

  const createdCategories: Record<string, string> = {};

  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = record.id;
  }

  console.log('✅ Categories created');

  // 4. Products
  const sampleProducts = [
    {
      name: 'Essential Oversized Heavyweight T-Shirt',
      slug: 'essential-oversized-heavyweight-t-shirt',
      description: 'Crafted from 280gsm 100% organic combed cotton with a relaxed streetwear cut.',
      price: 28.5,
      stock: 150,
      categoryId: createdCategories['t-shirts'],
      brand: 'Zara',
      sizes: 'S,M,L,XL',
      images:
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800,https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
    },
    {
      name: 'Vintage Distressed Straight Leg Jeans',
      slug: 'vintage-distressed-straight-leg-jeans',
      description: 'Mid-rise classic five-pocket denim with subtle washed fading and durable stitching.',
      price: 58.0,
      stock: 80,
      categoryId: createdCategories['jeans-denim'],
      brand: "Levi's",
      sizes: '29,30,31,32,34',
      images:
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800,https://images.unsplash.com/photo-1542272604-780c96856592?w=800',
    },
    {
      name: 'Minimalist Bomber Flight Jacket',
      slug: 'minimalist-bomber-flight-jacket',
      description: 'Water-resistant nylon bomber with ribbed cuffs, heavy metal zipper, and quilted lining.',
      price: 89.99,
      stock: 45,
      categoryId: createdCategories['jackets-coats'],
      brand: 'Uniqlo',
      sizes: 'M,L,XL',
      images:
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    },
    {
      name: 'Signature French Terry Fleece Hoodie',
      slug: 'signature-french-terry-fleece-hoodie',
      description: 'Ultra-soft fleece hoodie featuring kangaroo pocket, double-lined hood, and matching drawstrings.',
      price: 49.95,
      stock: 120,
      categoryId: createdCategories['hoodies'],
      brand: 'Nike',
      sizes: 'S,M,L,XL,XXL',
      images:
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    },
  ];

  for (const prod of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }

  console.log('✅ Sample products initialized');
  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
