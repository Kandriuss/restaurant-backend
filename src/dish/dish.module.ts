import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Dishes, DishSchema } from "libs/domain/src";
import { NestLoggerAdapter, SecurityModule } from "libs/infraestructure/src";
import { DishMongoRepository } from "./infraestructure/repositories/dish.mongo.repository";
import { DishController } from "./dish.controller";
import { DishService } from "./dish.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Dishes.name, schema: DishSchema }
        ]),
        SecurityModule
    ],
    providers: [
        DishService,
        {
            provide: 'DishRepository',
            useClass: DishMongoRepository
        },
        {
            provide: 'LoggerService',
            useFactory: () => new NestLoggerAdapter(DishService.name)
        }
    ],
    controllers: [DishController],
    exports: [DishService, 'DishRepository']
})
export class DishModule {}