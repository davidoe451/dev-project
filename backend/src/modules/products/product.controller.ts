import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service.js';
import { StorageService } from '../storage/storage.service.js';
import {
  CreateVariantDto,
  ProductListDto,
  UpdateVariantDto,
  UploadImageDto,
} from './product.dto.js';
import { Public, Role } from '../auth/decorator.js';
import { AuthGuard } from '../auth/auth.guard.js';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productsService: ProductService,
    private readonly storageService: StorageService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products with search, filters, sort and pagination' })
  findAll(@Query() query: ProductListDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product details with variants and images' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Public()
  @Get(':id/variants')
  @ApiOperation({ summary: 'List all variants for a product' })
  findVariants(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findVariants(id);
  }

  @UseGuards(AuthGuard)
  @Role('ADMIN')
  @ApiBearerAuth()
  @Post(':id/variants')
  @ApiOperation({ summary: 'Create a new variant for a product (Admin only)' })
  createVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateVariantDto,
  ) {
    return this.productsService.createVariant(id, dto);
  }

  @UseGuards(AuthGuard)
  @Role('ADMIN')
  @ApiBearerAuth()
  @Patch('variants/:variantId')
  @ApiOperation({ summary: 'Update variant stock or price (Admin only)' })
  updateVariant(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.productsService.updateVariant(variantId, dto);
  }

  @UseGuards(AuthGuard)
  @Role('ADMIN')
  @ApiBearerAuth()
  @Post(':id/images')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image for a product (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, jpeg, png, webp, max 5MB)',
        },
        isPrimary: { type: 'boolean', default: false },
        sortOrder: { type: 'integer', default: 0 },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException('Only image files (jpg, jpeg, png, webp) are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadImageDto,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    const uploaded = await this.storageService.uploadFile(file, 'product-images');
    return this.productsService.addImage(
      id,
      uploaded.url,
      uploaded.key,
      dto.isPrimary,
      dto.sortOrder,
    );
  }

  @UseGuards(AuthGuard)
  @Role('ADMIN')
  @ApiBearerAuth()
  @Patch('images/:imageId/primary')
  @ApiOperation({ summary: 'Set an image as primary (Admin only)' })
  setPrimaryImage(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.productsService.setPrimaryImage(imageId);
  }

  @UseGuards(AuthGuard)
  @Role('ADMIN')
  @ApiBearerAuth()
  @Delete('images/:imageId')
  @ApiOperation({ summary: 'Delete a product image (Admin only)' })
  deleteImage(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.productsService.deleteImage(imageId);
  }
}
