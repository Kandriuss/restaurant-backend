import { Module } from '@nestjs/common';
import { JwtAdapterService } from '../adapters';
import { JwtAuthGuard } from './guards';
import { NestLoggerAdapter } from '../logger';

@Module({
  providers: [
    {
      provide: 'JwtAdapterService',
      useFactory: (logger: NestLoggerAdapter) => {
        return new JwtAdapterService(logger);
      },
      inject: ['LoggerService']
    },
    {
      provide: 'LoggerService',
      useFactory: () => new NestLoggerAdapter('SecurityModule')
    },
    JwtAuthGuard
  ],
  exports: [
    'JwtAdapterService',
    JwtAuthGuard
  ]
})
export class SecurityModule {}