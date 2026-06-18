import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { SecurityModule } from './security/security.module';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.resolve(process.cwd(), '../../.env'), path.resolve(process.cwd(), '.env')],
    }),
    DbModule,
    SecurityModule,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class LocalDevModule {}
