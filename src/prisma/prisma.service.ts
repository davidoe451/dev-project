import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma successfully connected to database');
    } catch (error) {
      this.logger.warn(
        `Failed to connect to MySQL database at startup: ${error.message}. Please ensure MySQL is running and migrations have been applied.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
