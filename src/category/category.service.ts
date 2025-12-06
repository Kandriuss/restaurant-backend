import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { ICategoryRepository } from './domain';
import type { CategoryInput, ILogger } from 'libs/domain/src';
import { ICategory } from 'libs/domain/src/interfaces/category/category.interface';
import { errorMessagesCategory } from 'libs/infraestructure/src/constants';

@Injectable()
export class CategoryService {
    constructor(
        @Inject('CategoryRepository')
        private readonly categoryRepository: ICategoryRepository,
        @Inject('LoggerService')
        private readonly logger: ILogger
    ){}
}
