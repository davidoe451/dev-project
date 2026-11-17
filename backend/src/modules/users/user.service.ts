import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async setActive(id: number, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found'); //err404: not found

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      omit: { password: true },
    });
  }
}