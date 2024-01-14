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
import { FollowService } from './follow.service';
import { Request, Response } from 'express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { QueryDTO } from './dto/query-follow.dto';

@ApiTags('Follow')
@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Get('general')
  async getAccountProfileGeneral(
    @Query('account') accountId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const result =
        await this.followService.getAccountProfileGeneral(accountId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  @Get('following')
  async getAccountProfileFollowing(
    @Query('account') accountId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const result = await this.followService.getAccountFollowing(accountId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  @Get('follower')
  async getAccountProfileFollower(
    @Query('account') accountId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const result = await this.followService.getAccountFollower(accountId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
}
