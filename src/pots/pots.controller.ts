import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PotsService } from './pots.service';
import { CreatePotDto } from './dto/create-pot.dto';
import { UpdatePotDto } from './dto/update-pot.dto';

@Controller('pots')
export class PotsController {
  constructor(private readonly potsService: PotsService) {}
}
