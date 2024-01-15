import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [FeedController],
  providers: [FeedService],
  imports: [RedisModule],
})
export class FeedModule {}
