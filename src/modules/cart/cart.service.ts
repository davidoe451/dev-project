import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedItems = items.map((item) => {
      const price = Number(item.product.price);
      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        productImage: item.product.images?.split(',')[0] || '',
        price,
        size: item.size,
        quantity: item.quantity,
        totalPrice: price * item.quantity,
        inStock: item.product.stock >= item.quantity && item.product.isActive,
      };
    });

    const subtotal = formattedItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const totalItems = formattedItems.reduce((acc, curr) => acc + curr.quantity, 0);

    return {
      items: formattedItems,
      summary: {
        totalItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
      },
    };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found or currently unavailable');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException(`Only ${product.stock} items left in stock`);
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId_size: {
          userId,
          productId: dto.productId,
          size: dto.size,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Cannot add more than available stock (${product.stock})`);
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        userId,
        productId: dto.productId,
        size: dto.size,
        quantity: dto.quantity,
      },
    });
  }

  async updateItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.product.stock < dto.quantity) {
      throw new BadRequestException(`Only ${item.product.stock} items available in stock`);
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
