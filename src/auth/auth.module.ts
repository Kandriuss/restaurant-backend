import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UserSchema } from 'libs/domain/src';
import { AuthController } from './auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserMongoRepository } from 'src/user/infraestructure/repositories/user.mongo.repository';
import { JwtAdapterService } from 'libs/infraestructure/src/adapters/jwt/jwt.adapter';
import { NestLoggerAdapter } from 'libs/infraestructure/src';

@Module({
    imports: [
        UserModule,
        MongooseModule.forFeature([ 
            { name: Users.name, schema: UserSchema }
        ]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService, 
        {
            provide: 'UserRepository',
            useClass: UserMongoRepository
        },
        {
            provide: 'LoggerService',
            useFactory: () => new NestLoggerAdapter(JwtAdapterService.name)
        },
        {
            provide: 'JwtAdapterService',
            useFactory: (logger) => new JwtAdapterService(logger),
            inject: ['LoggerService']
        }
    ],
    exports: [AuthService]
})
export class AuthModule {}   
