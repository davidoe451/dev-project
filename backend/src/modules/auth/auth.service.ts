import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LoginDto, RegisterDto } from './auth.dto.js';
import { JwtService } from '@nestjs/jwt';
import { isPrismaUniqueError } from '../../common/utils/prisma-errors.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const role = await this.prisma.role.findUniqueOrThrow({
      where: { code: 'CUSTOMER' },
    });

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          password: hashedPassword,
          roleId: role.id,
          isActive: true, // for testing customer
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          isActive: true,
          roleId: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    const isMatch = user ? await bcrypt.compare(dto.password, user.password) : false;

    if (!user || !isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    const payload = { id: user.id, email: user.email, role: user.role.code };
    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role.code,
      },
    };
  }
}
