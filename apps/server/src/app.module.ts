import { Module } from '@nestjs/common';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { ServicesController } from './services/services.controller';
import { ServicesService } from './services/services.service';
import { LawyerNotaryModule } from './lawyer-notary/lawyer-notary.module';
import { AuthModule } from './auth/auth.module';
import { VendorsModule } from './vendors/vendors.module';
import { PrismaModule } from './prisma/prisma.module';
import { WillsController } from './wills/wills.controller';

@Module({
  imports: [PrismaModule, LawyerNotaryModule, AuthModule, VendorsModule],
  controllers: [CategoriesController, ServicesController, WillsController],
  providers: [CategoriesService, ServicesService],
})
export class AppModule {}

