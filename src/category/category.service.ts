import { Injectable, Inject, BadRequestException, ConflictException, InternalServerErrorException, NotFoundException, HttpException } from '@nestjs/common';
import type { ICategoryRepository, IPatchCategory } from './domain';
import type { CategoryInput, ILogger, PatchCategoryInput } from 'libs/domain/src';
import { ICategory } from 'libs/domain/src/interfaces/category/category.interface';
import { errorMessagesCategory, errorMessagesCode, errorMessagesGlobal } from 'libs/infraestructure/src/constants';

@Injectable()
export class CategoryService {
    constructor(
        @Inject('CategoryRepository')
        private readonly categoryRepository: ICategoryRepository,
        @Inject('LoggerService')
        private readonly logger: ILogger
    ){}

    async create(category: CategoryInput): Promise<ICategory> {
        try {
            const createCategory = await this.categoryRepository.create(category);
            
            this.logger.log(errorMessagesCategory.createCategorySuccess);
            return createCategory as ICategory;
        }catch (error) {
            if (error.message === errorMessagesCode.DUPLICATE_ENTRY) {
                this.logger.warn(errorMessagesGlobal.codeDuplicate(category.code));
                throw new ConflictException(errorMessagesGlobal.codeDuplicate(category.code));
            };

            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };

            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            };

            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        }
    };

    async findAll(): Promise<ICategory[]> {
        try {
            const categories = await this.categoryRepository.findAll();
            
            this.logger.log(errorMessagesCategory.findAllSuccess(categories.length));
            return categories as ICategory[];
        } catch (error) {
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError, error);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            }
        
            if (error instanceof HttpException) {
                throw error;
            }
        
            this.logger.error(errorMessagesGlobal.unexpectedError, error);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        }
        
    };

    async findById(id: string): Promise<ICategory | null> {
        try {
            const category = await this.categoryRepository.findById(id);
            
            this.logger.log(errorMessagesCategory.findByIdSuccess(id));
            return category as ICategory;
        }catch (error) {
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };

            if (error instanceof HttpException) {
                throw error;
            };

            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        }
    };

    async update(id: string, category: PatchCategoryInput): Promise<IPatchCategory | null> {
        try {
            const updatedCategory = await this.categoryRepository.update(id, category);
            
            this.logger.log(errorMessagesCategory.updateSuccess(id));
            return updatedCategory as ICategory;
        }catch (error) {
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };

            if (error instanceof HttpException) {
                throw error;
            };

            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        }
    };

    async delete(id: string): Promise<{ message: string }> {
        try {
            const deleted = await this.categoryRepository.delete(id);
            if (!deleted) throw new NotFoundException(errorMessagesCategory.findByIdNotFound(id));
            
            this.logger.log(errorMessagesCategory.deleteSuccess(id));
            return { message: errorMessagesCategory.deleteCategorySuccess };
        }catch (error) {
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };

            if (error instanceof HttpException) {
                throw error;
            };

            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        }
    }
};
