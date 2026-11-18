import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CreateVariantDto,
  ProductListDto,
  ProductSort,
  UpdateVariantDto,
} from './product.dto.js';
import { SIZE, Size } from '../../common/constants/size.js';
import { isPrismaUniqueError } from '../../common/utils/prisma-errors.js';
import { StorageService } from '../storage/storage.service.js';

const ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ createdAt: 'desc' }, { id: 'desc' }],
  price_asc: [{ price: 'asc' }, { id: 'asc' }],
  price_desc: [{ price: 'desc' }, { id: 'desc' }],
  name_asc: [{ name: 'asc' }, { id: 'asc' }],
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(query: ProductListDto) {
    const {
      search,
      categoryId,
      category,
      brandId,
      brand,
      minPrice,
      maxPrice,
      size,
      inStockOnly,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = query;

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      throw new BadRequestException('minPrice must not be greater than maxPrice');
    }

    const where: Prisma.ProductWhereInput = { isActive: true };
    if (search) where.name = { contains: search };
    if (categoryId) where.categoryId = categoryId;
    if (category) where.category = { slug: category };
    if (brandId) where.brandId = brandId;
    if (brand) where.brand = { slug: brand };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = { gte: minPrice, lte: maxPrice };
    }
    if (size) where.variants = { some: { size, isActive: true } };
    if (inStockOnly) where.variants = { some: { size, isActive: true, stock: { gt: 0 } } };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: ORDER_BY[sort],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          isActive: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
            select: { id: true, url: true, isPrimary: true, sortOrder: true },
          },
          variants: {
            where: { isActive: true },
            select: { id: true, sku: true, size: true, color: true, price: true, stock: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const items = products.map(({ images, variants, price, ...product }) => ({
      ...product,
      price: Number(price),
      images,
      variants: variants.map((variant) => ({
        ...variant,
        price: Number(variant.price ?? price),
      })),
      imageUrl: images[0]?.url ?? null,
      sizes: [...new Set(variants.map((v) => v.size))].sort(
        (a, b) => SIZE.indexOf(a as Size) - SIZE.indexOf(b as Size),
      ),
      inStock: variants.some((v) => v.stock > 0),
    }));

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(idOrSlug: string) {
    const id = Number(idOrSlug);
    const product = await this.prisma.product.findFirst({
      where: { ...(Number.isSafeInteger(id) && id > 0 ? { id } : { slug: idOrSlug }), isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        isActive: true,
        createdAt: true,
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          select: { id: true, url: true, isPrimary: true, sortOrder: true },
        },
        variants: {
          where: { isActive: true },
          select: { id: true, sku: true, size: true, color: true, price: true, stock: true },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    const { price, variants, ...rest } = product;

    const sortedVariants = variants
      .map((v) => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        price: Number(v.price ?? price),
        stock: v.stock,
        inStock: v.stock > 0,
      }))
      .sort(
        (a, b) =>
          SIZE.indexOf(a.size as Size) - SIZE.indexOf(b.size as Size) ||
          a.color.localeCompare(b.color),
      );

    return {
      ...rest,
      price: Number(price),
      variants: sortedVariants,
      inStock: sortedVariants.some((v) => v.inStock),
    };
  }

  // US-14: Variant APIs
  async findVariants(productId: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: [{ size: 'asc' }, { color: 'asc' }],
    });

    return variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
      inStock: v.stock > 0,
    }));
  }

  async createVariant(productId: number, dto: CreateVariantDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    try {
      const variant = await this.prisma.productVariant.create({
        data: {
          productId,
          sku: dto.sku,
          size: dto.size,
          color: dto.color,
          price: dto.price,
          stock: dto.stock ?? 0,
        },
      });
      return { ...variant, price: variant.price ? Number(variant.price) : null };
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        throw new ConflictException('Variant with this SKU or size/color already exists');
      }
      throw error;
    }
  }

  async updateVariant(variantId: number, dto: UpdateVariantDto) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Variant not found');

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return { ...updated, price: updated.price ? Number(updated.price) : null };
  }

  async addImage(
    productId: number,
    url: string,
    publicId?: string,
    isPrimary = false,
    sortOrder = 0,
  ) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    if (isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.productImage.create({
      data: {
        productId,
        url,
        publicId,
        isPrimary,
        sortOrder,
      },
    });
  }

  async deleteImage(imageId: number) {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found');

    if (image.publicId) {
      await this.storageService.deleteFile(image.publicId);
    }

    await this.prisma.productImage.delete({ where: { id: imageId } });
    return { message: 'Image deleted successfully' };
  }

  async setPrimaryImage(imageId: number) {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found');

    await this.prisma.productImage.updateMany({
      where: { productId: image.productId },
      data: { isPrimary: false },
    });

    return this.prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  }
}
