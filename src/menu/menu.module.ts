import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Menus, MenuSchema } from 'libs/domain/src/models';
import { DishModule } from 'src/dish/dish.module';
import { SecurityModule } from 'libs/infraestructure/src/security';
import { NestLoggerAdapter } from 'libs/infraestructure/src';
import { MenuMongoRepository } from './infraestructure';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Menus.name, schema: MenuSchema }
    ]),
    DishModule,
    SecurityModule,
  ],
  providers: [
    MenuService,
    {
      provide: 'MenuRepository',
      useClass: MenuMongoRepository
    },
    {
      provide: 'LoggerService',
      useFactory: () => new NestLoggerAdapter(MenuService.name)
    }
  ],
  controllers: [MenuController]
})
export class MenuModule {}
