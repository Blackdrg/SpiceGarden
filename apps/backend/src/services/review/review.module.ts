import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { DbModule } from '../../db/db.module';
import { ReviewDocument, ReviewSchema } from '../../db/schemas/review.schema';

const localSqlite = process.env.LOCAL_DB === 'sqlite' || (!process.env.DB_HOST && process.env.NODE_ENV !== 'production');

@Module({
  imports: localSqlite ? [DbModule] : [DbModule, MongooseModule.forFeature([{ name: ReviewDocument.name, schema: ReviewSchema }])],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [ReviewService],
})
export class ReviewServiceModule {}