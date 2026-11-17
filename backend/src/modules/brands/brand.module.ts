import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller.js';
import { BrandService } from './brand.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}