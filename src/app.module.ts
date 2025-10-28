import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'libs/infraestructure/src/database';

//Modulos
import { AuthModule } from './auth/auth.module';
import { SecurityModule } from 'libs/infraestructure/src/security';
import { UserModule } from 'src/user/user.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    //Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    //Configuración de base de datos
    DatabaseModule,
    AuthModule,
    SecurityModule,
    RoleModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
