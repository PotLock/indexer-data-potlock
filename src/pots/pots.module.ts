import { Module } from '@nestjs/common';
import { PotsService } from './pots.service';
import { PotsController } from './pots.controller';

@Module({
  controllers: [PotsController],
  providers: [PotsService],
})
export class PotsModule {}
