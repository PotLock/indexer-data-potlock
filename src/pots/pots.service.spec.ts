import { Test, TestingModule } from '@nestjs/testing';
import { PotsService } from './pots.service';

describe('PotsService', () => {
  let service: PotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PotsService],
    }).compile();

    service = module.get<PotsService>(PotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
