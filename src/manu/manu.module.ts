import { Module } from '@nestjs/common';
import { ManuService } from './manu.service';
import { ManuController } from './manu.controller';

@Module({
  providers: [ManuService],
  controllers: [ManuController]
})
export class ManuModule {}
