import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Categories, CategorySchema } from 'libs/domain/src/models/category';
import { SecurityModule } from 'libs/infraestructure/src/security';
import { CategoryMongoRepository } from './infraestructure/repository';
import { NestLoggerAdapter } from 'libs/infraestructure/src/adapters';
import { CategoryController } from './category.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Categories.name, schema: CategorySchema }
    ]),
    SecurityModule
  ],
  providers: [
    CategoryService,
    {
      provide: 'CategoryRepository',
      useClass: CategoryMongoRepository
    },
    {
      provide: 'LoggerService',
      useFactory: () => new NestLoggerAdapter(CategoryService.name)
    }
  ],
  controllers: [CategoryController],
  exports: [CategoryService, 'CategoryRepository']
})
export class CategoryModule {}
