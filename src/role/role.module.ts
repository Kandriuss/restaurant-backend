import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleMongoRepository } from './infraestructure';
import { MongooseModule } from '@nestjs/mongoose';
import { Roles, RoleSchema } from 'libs/domain/src'
import { NestLoggerAdapter, SecurityModule } from 'libs/infraestructure/src';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Roles.name, schema: RoleSchema }
    ]),
    SecurityModule
  ],
  providers: [
    RoleService,
    {
      provide: 'RoleRepository',
      useClass: RoleMongoRepository
    },
    {
      provide: 'LoggerService', 
      useFactory: () => new NestLoggerAdapter(RoleMongoRepository.name)
    }
  ],
  controllers: [RoleController],
  exports: [RoleService, 'RoleRepository']
})
export class RoleModule {}
