import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  Query,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProjectService } from './project.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { QueryDTO } from './dto/query-project.dto';

@Controller('project')
@ApiTags('Project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('/general')
  async getGeneral(@Res() res: Response) {
    try {
      const result = await this.projectService.getGeneral();
      return res.status(200).json({
        ...result,
      });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  @Get('')
  @ApiQuery({
    type: QueryDTO,
  })
  async getAllProject(@Res() res: Response, @Req() req: Request) {
    try {
      const result = await this.projectService.getAllProject(req);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  @Get(':id')
  async getSingleProject(
    @Param('id') projectId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const result = await this.projectService.getProjectDetail(projectId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
}
