import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { PlatformFeeService } from './platform-fee.service';
import { PlatformFeeController } from './platform-fee.controller';
import { PlatformFeeEntity } from '../../db/entities/platform-fee.entity';

@Module({
  imports: [DbRepositoriesModule],
  providers: [PlatformFeeService],
  controllers: [PlatformFeeController],
  exports: [PlatformFeeService],
})
export class PlatformFeeModule {}
