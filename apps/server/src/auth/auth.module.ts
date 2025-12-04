import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard, KeycloakConnectModule } from 'nest-keycloak-connect';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DebugRoleGuard } from './debug-role.guard';
import { createKeycloakConfig } from './keycloak.config';

@Global()
@Module({
  imports: [
    PrismaModule,
    EmailModule,
    KeycloakConnectModule.registerAsync({
      imports: [ConfigModule],
      useFactory: createKeycloakConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Global guards for Keycloak
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // ResourceGuard removed for debugging
    // {
    //   provide: APP_GUARD,
    //   useClass: ResourceGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: DebugRoleGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
