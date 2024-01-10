import { Injectable } from '@nestjs/common';
import { CreatePotDto } from './dto/create-pot.dto';
import { UpdatePotDto } from './dto/update-pot.dto';

@Injectable()
export class PotsService {
  create(createPotDto: CreatePotDto) {
    return 'This action adds a new pot';
  }

  findAll() {
    return `This action returns all pots`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pot`;
  }

  update(id: number, updatePotDto: UpdatePotDto) {
    return `This action updates a #${id} pot`;
  }

  remove(id: number) {
    return `This action removes a #${id} pot`;
  }
}
