import { IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDTO {
  @ApiPropertyOptional({ description: 'limit=10 p/s: default = 30' })
  limit: number;

  @ApiPropertyOptional({
    description: 'from=1697636424121 p/s: from blockheight',
  })
  from: number;

  @IsString()
  @ApiPropertyOptional({
    description: 'account=magicbuild.near p/s: default will return main feed',
  })
  account: string;
}
