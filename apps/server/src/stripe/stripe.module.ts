import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STRIPE_CLIENT,
      useFactory: (configService: ConfigService): Stripe => {
        const secretKey = configService.get<string>('STRIPE_SECRET_KEY');

        if (!secretKey) {
          throw new Error('STRIPE_SECRET_KEY is not configured');
        }

        return new Stripe(secretKey, {
          apiVersion: '2025-11-17.clover',
          typescript: true,
        });
      },
      inject: [ConfigService],
    },
    StripeService,
  ],
  exports: [STRIPE_CLIENT, StripeService],
})
export class StripeModule {}
