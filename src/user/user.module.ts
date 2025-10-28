import { Module } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UserSchema} from 'libs/domain/src/models';
import { UserMongoRepository } from './infraestructure';
import { RoleModule } from '../role/role.module';
import { SecurityModule, NestLoggerAdapter } from 'libs/infraestructure/src';


@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Users.name, schema: UserSchema}
    ]),
    RoleModule,
    SecurityModule
  ],
  providers: [
    UserService,
    {
      provide: 'UserRepository',
      useClass: UserMongoRepository
    },
    {
      provide: 'LoggerService',
      useFactory: () => new NestLoggerAdapter(UserService.name)
    }
  ],
  controllers: [UserController],
  exports: [UserService, 'UserRepository']
})
export class UserModule {}
