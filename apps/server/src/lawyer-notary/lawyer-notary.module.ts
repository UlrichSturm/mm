import { Module, forwardRef } from '@nestjs/common';
import { LawyerNotaryController } from './lawyer-notary.controller';
import { LawyerNotaryService } from './lawyer-notary.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [LawyerNotaryController],
  providers: [LawyerNotaryService],
  exports: [LawyerNotaryService],
})
export class LawyerNotaryModule {}

