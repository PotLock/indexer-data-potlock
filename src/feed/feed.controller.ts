import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { Request, Response } from 'express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { QueryDTO } from './dto/query-feed-dto';

@Controller('feed')
@ApiTags('Feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('')
  @ApiQuery({ type: QueryDTO })
  async getFeedDetail(@Res() res: Response, @Req() req: Request) {
    try {
      const result = await this.feedService.getFeedDetail(req);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
}
