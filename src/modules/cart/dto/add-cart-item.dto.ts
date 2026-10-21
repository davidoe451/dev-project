import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @ApiProperty({ example: 'product-uuid-123' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 'M' })
  @IsNotEmpty()
  @IsString()
  size: string;

  @ApiProperty({ example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
}
