import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { Project, ProjectSchema } from 'src/project/schemas/project.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Donation, DonationSchema } from 'src/donation/schemas/donation.schema';
import { RedisModule } from 'src/redis/redis.module';
import { ProjectModule } from 'src/project/project.module';

@Module({
  controllers: [FollowController],
  providers: [FollowService],
  imports: [
    RedisModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Donation.name, schema: DonationSchema },
    ]),
    ProjectModule,
  ],
})
export class FollowModule {}
