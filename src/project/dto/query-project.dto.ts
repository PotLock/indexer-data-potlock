import { IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDTO {
  @IsString()
  @ApiPropertyOptional({})
  limit: string;

  @IsString()
  @ApiPropertyOptional()
  page: string;

  @IsString()
  @ApiPropertyOptional()
  title: string;

  @IsString()
  @ApiPropertyOptional()
  sort: string;
}
