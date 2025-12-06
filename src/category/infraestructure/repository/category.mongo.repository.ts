import { InjectModel} from "@nestjs/mongoose";
import { Injectable, Inject } from "@nestjs/common";
import { Categories } from "libs/domain/src/models/category";
import { ICategoryRepository } from "src/category/domain";
import { Model } from "mongoose";
import type { CategoryInput, ILogger } from 'libs/domain/src'
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
    }

}