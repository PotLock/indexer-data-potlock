import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';
import { AuthModule } from './auth/auth.module';
import { FeedModule } from './feed/feed.module';
import { PotsModule } from './pots/pots.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ProjectModule, AuthModule, FeedModule, PotsModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
