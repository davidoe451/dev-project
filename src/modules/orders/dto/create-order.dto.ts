import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'John Doe', description: 'Recipient customer name' })
  @IsNotEmpty({ message: 'Customer name is required' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: '0987654321', description: 'Recipient phone number' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Fashion Street, District 1, HCMC', description: 'Delivery address' })
  @IsNotEmpty({ message: 'Address is required' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: 'Deliver during office hours', description: 'Optional order note' })
  @IsOptional()
  @IsString()
  note?: string;
}
