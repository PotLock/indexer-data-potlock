import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDTO {
  @IsString()
  @ApiProperty({ description: 'example: magicbuild.near' })
  account: string;
}
