import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SIZE } from '../../common/constants/size.js';

export const PRODUCT_SORTS = ['newest', 'price_asc', 'price_desc', 'name_asc'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export class ProductListDto {
  @ApiPropertyOptional({ description: 'Search by product name' })
  @IsOptional() @IsString() @MaxLength(100)
  search?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Category slug' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  brandId?: number;

  @ApiPropertyOptional({ description: 'Brand slug' })
  @IsOptional() @IsString()
  brand?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  minPrice?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: SIZE })
  @IsOptional() @IsIn(SIZE)
  size?: string;

  @ApiPropertyOptional({ description: 'Only products with available stock' })
  @IsOptional() @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value) @IsBoolean()
  inStockOnly?: boolean;

  @ApiPropertyOptional({ enum: PRODUCT_SORTS, default: 'newest' })
  @IsOptional() @IsIn(PRODUCT_SORTS)
  sort?: (typeof PRODUCT_SORTS)[number] = 'newest';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12, maximum: 50 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit?: number = 12;
}

export class CreateVariantDto {
  @ApiProperty({ example: 'SHIRT-BLK-M' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ enum: SIZE, example: 'M' })
  @IsIn(SIZE)
  size: string;

  @ApiProperty({ example: 'Black' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiPropertyOptional({ example: 29.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 50, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number = 0;
}

export class UpdateVariantDto {
  @ApiPropertyOptional({ example: 29.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UploadImageDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
