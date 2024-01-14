import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { Donation, DonationSchema } from 'src/donation/schemas/donation.schema';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  imports: [
    RedisModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Donation.name, schema: DonationSchema },
    ]),
  ],
})
export class ProjectModule {}
