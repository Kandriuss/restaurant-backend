import { InjectModel} from "@nestjs/mongoose";
import { Injectable, Inject } from "@nestjs/common";
import { Categories } from "libs/domain/src/models/category";
import { ICategoryRepository, IPatchCategory } from "src/category/domain";
import { Model } from "mongoose";
import type { CategoryInput, ILogger, PatchCategoryInput } from 'libs/domain/src'
import { ICategory } from "libs/domain/src/interfaces/category/category.interface";
import { errorMessagesCode, errorMessagesCategory, errorMessagesGlobal } from "libs/infraestructure/src/constants";
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'categories';

@Injectable()
export class CategoryMongoRepository implements ICategoryRepository {

    constructor(
        @InjectModel(Categories.name) private readonly categoryModel: Model<Categories>,
        @Inject('LoggerService') private readonly logger: ILogger,
    ){}

    async create(category: CategoryInput): Promise<ICategory> {
        try {
            const id = uuidv4();
            const existingCategory = await this.categoryModel.findOne({ code: category.code });

            if (existingCategory) {
                this.logger.warn(errorMessagesGlobal.codeDuplicate(category.code));
                throw new Error(errorMessagesCode.ROLE_CODE_ALREADY_EXISTS);
            }

            const newCategory = new this.categoryModel({ ...category, id, active: true });
            await newCategory.save();

            this.logger.log(errorMessagesCategory.createSuccess(category.code, id));
            return newCategory as ICategory;
        } catch (error) {
            if (error.message === errorMessagesCode.ROLE_CODE_ALREADY_EXISTS) throw error;
            
            this.logger.error(errorMessagesCategory.createError(error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    };

    async findAll(): Promise<ICategory[]> {
        try {
            const categories = await this.categoryModel.find();
            this.logger.log(errorMessagesCategory.findAllSuccess(categories.length));
            return categories as ICategory[];
        } catch (error) {
            this.logger.error(errorMessagesCategory.findAllError(error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    };

    async findById(id: string): Promise<ICategory | null> {
        try {
            const category = await this.categoryModel.findOne({ id }).exec();
            if (!category) {
                this.logger.warn(errorMessagesCategory.findByIdNotFound(id));
                return null;
            }
            this.logger.log(errorMessagesCategory.findByIdSuccess(id));
            return category as ICategory;
        } catch (error) {
            this.logger.error(errorMessagesCategory.findByIdError(id, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    };

    async findByCode(code: string): Promise<ICategory | null> {
        try {
            const category = await this.categoryModel.findOne({ code }).exec();
            if (!category) {
                this.logger.warn(errorMessagesCategory.findByCodeNotFound(code));
                return null;
            }
            this.logger.log(errorMessagesCategory.findByCodeSuccess(code));
            return category as ICategory;
        } catch (error) {
            this.logger.error(errorMessagesCategory.findByCodeError(code, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    };

    async update(id: string, category: PatchCategoryInput): Promise<IPatchCategory | null> {
        try {
            const existingCategory = await this.categoryModel.findOne({ id });
            if (!existingCategory) {
                this.logger.warn(errorMessagesCategory.findByIdNotFound(id));
                return null;
            }

            const updateCategory = await this.categoryModel.findOneAndUpdate(
                { id },
                { ...category },
                { new: true }
            ).exec();
            this.logger.log(errorMessagesCategory.updateSuccess(id));
            return updateCategory as IPatchCategory;
        } catch (error) {
            this.logger.error(errorMessagesCategory.updateError(id, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    };

    async delete(id: string): Promise<boolean> {
        try {
            const existingCategory = await this.categoryModel.findOne({ id });
            if (!existingCategory) {
                this.logger.warn(errorMessagesCategory.findByIdNotFound(id));
                return false;
            }
            await this.categoryModel.deleteOne({ id }).exec();
            this.logger.log(errorMessagesCategory.deleteSuccess(id));
            return true;
        } catch (error) {
            this.logger.error(errorMessagesCategory.deleteError(id, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    };
}