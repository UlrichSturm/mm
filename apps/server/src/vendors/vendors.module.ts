import { Module, forwardRef } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { AuthModule } from '../auth/auth.module';
import { KeycloakModule } from '../keycloak/keycloak.module';

@Module({
  imports: [forwardRef(() => AuthModule), KeycloakModule],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}

