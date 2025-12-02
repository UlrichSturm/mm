import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { ServicesController } from './services/services.controller';
import { ServicesService } from './services/services.service';
import { LawyerNotaryModule } from './lawyer-notary/lawyer-notary.module';
import { AuthModule } from './auth/auth.module';
import { VendorsModule } from './vendors/vendors.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { WillsController } from './wills/wills.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
      {
        name: 'strict',
        ttl: 60000,
        limit: 10, // 10 requests per minute for sensitive endpoints
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules
    HealthModule,
    AuthModule,
    VendorsModule,
    LawyerNotaryModule,
  ],
  controllers: [CategoriesController, ServicesController, WillsController],
  providers: [CategoriesService, ServicesService],
})
export class AppModule {}
