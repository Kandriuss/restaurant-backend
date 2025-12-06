import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'libs/infraestructure/src/database';

//Modulos
import { AuthModule } from './auth/auth.module';
import { SecurityModule } from 'libs/infraestructure/src/security';
import { UserModule } from 'src/user/user.module';
import { RoleModule } from 'src/role/role.module';
import { DishModule } from 'src/dish/dish.module';
import { MenuModule } from './menu/menu.module';
import { CategoryController } from './category/category.controller';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    //Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    //Configuración de base de datos
    DatabaseModule,
    //Configuración de modulos
    AuthModule,
    SecurityModule,
    RoleModule,
    UserModule,
    DishModule,
    MenuModule,
    CategoryModule,
  ],
  controllers: [CategoryController],
  providers: [],
})
export class AppModule {}
