import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LawyerNotaryModule } from './lawyer-notary/lawyer-notary.module';
import { AuthModule } from './auth/auth.module';
import { VendorsModule } from './vendors/vendors.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { StripeModule } from './stripe/stripe.module';
import { EmailModule } from './email/email.module';
import { StorageModule } from './storage/storage.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ServicesModule } from './services/services.module';
import { CategoriesModule } from './categories/categories.module';
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

    // External services
    StripeModule,
    EmailModule,
    StorageModule,

    // Feature modules
    HealthModule,
    AuthModule,
    VendorsModule,
    LawyerNotaryModule,
    CategoriesModule,
    ServicesModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [WillsController],
  providers: [],
})
export class AppModule {}
