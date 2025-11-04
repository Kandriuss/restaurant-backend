import { Module } from '@nestjs/common';
import { JwtAdapterService } from '../adapters';
import { JwtAuthGuard, RolesGuard } from './guards';
import { NestLoggerAdapter } from '../adapters/logger';

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
    JwtAuthGuard,
    RolesGuard
  ],
  exports: [
    'JwtAdapterService',
    JwtAuthGuard,
    RolesGuard
  ]
})
export class SecurityModule {}