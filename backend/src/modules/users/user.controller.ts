import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service.js';
import { SetActiveDto } from './user.dto.js';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard.js';
import { Role } from '../auth/decorator.js';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Role('ADMIN')
  @ApiBearerAuth()
  @Patch(':id/active')
  @ApiOperation({ summary: 'Activate or deactivate a user (Admin only)' })
  setActive(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetActiveDto,
  ) {
    if (req.user?.id === id && !dto.isActive) {
      throw new BadRequestException('Cannot deactivate your own account');
    }
    return this.userService.setActive(id, dto.isActive);
  }
}
