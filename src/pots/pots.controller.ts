import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PotsService } from './pots.service';
import { CreatePotDto } from './dto/create-pot.dto';
import { UpdatePotDto } from './dto/update-pot.dto';

@Controller('pots')
export class PotsController {
  constructor(private readonly potsService: PotsService) {}

  @Post()
  create(@Body() createPotDto: CreatePotDto) {
    return this.potsService.create(createPotDto);
  }

  @Get()
  findAll() {
    return this.potsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.potsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePotDto: UpdatePotDto) {
    return this.potsService.update(+id, updatePotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.potsService.remove(+id);
  }
}
