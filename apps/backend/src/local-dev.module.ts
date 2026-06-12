import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.resolve(process.cwd(), '../../.env'), path.resolve(process.cwd(), '.env')],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class LocalDevModule {}
