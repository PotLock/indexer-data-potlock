import { IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDTO {
  @IsString()
  @ApiPropertyOptional({ description: 'limit=10 p/s: default = 30' })
  limit: string;

  @IsString()
  @ApiPropertyOptional({ description: 'page=2' })
  page: string;

  @IsString()
  @ApiPropertyOptional({ description: 'title=magicbuild p/s: this is search' })
  title: string;

  @IsString()
  @ApiPropertyOptional({ description: 'sort=-id,dateCreated' })
  sort: string;
}
