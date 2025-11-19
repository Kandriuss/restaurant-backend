import {Injectable, Inject, BadRequestException} from "@nestjs/common";
import {InjectModel} from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { DishInput, Dishes, PatchDishInput } from "libs/domain/src";
import type { ILogger } from 'libs/domain/src'
import { IDishRepository, IDishPatch } from "src/dish/domain";
import { IDish } from "src/dish/domain";
import { errorMessagesCode, errorMessagesGlobal, errorMessagesDish } from "libs/infraestructure/src/constants";

const COLLECTION_NAME = 'dishes';

@Injectable()
export class DishMongoRepository implements IDishRepository {
    constructor(
        @InjectModel(Dishes.name) private readonly dishModel: Model <Dishes>,
        @Inject('LoggerService') private readonly logger: ILogger,
    ){}

    async create(dish: DishInput): Promise<IDish> {
        try {
            const id = uuidv4();
            const existingDish = await this.dishModel.findOne({ name: dish.name });
            
            if (existingDish){
                this.logger.warn(errorMessagesDish.createNameDuplicate(dish.name));
                throw new Error(errorMessagesCode.DUPLICATE_ENTRY);
            };

            const newDish = new this.dishModel({
                ...dish,
                id,
                active: true
            });

            await newDish.save();
            this.logger.log(errorMessagesDish.createSuccess(dish.name, id));
            return newDish as IDish;
        } catch (error) {
            if (error.message === errorMessagesCode.DUPLICATE_ENTRY) throw error;
            
            this.logger.error(errorMessagesDish.createError(dish?.name ?? errorMessagesGlobal.unknown));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };

    async findAll(): Promise<IDish[]> {
        try {
            const dishes = await this.dishModel.find();

            this.logger.log(errorMessagesDish.findAllSuccess(dishes.length));
            return dishes as IDish[];
        } catch (error) {
            this.logger.error(errorMessagesDish.findAllError(error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    };

    async findById(id: string): Promise<IDish | null> {
        try {
            const dish = await this.dishModel.findOne({ id }).exec();
            if (!dish) {
                this.logger.warn(errorMessagesDish.findByIdNotFound(id));
                return null;
            };

            this.logger.log(errorMessagesDish.findByIdSuccess(id));
             return dish as IDish;
        } catch (error) {
            this.logger.error(errorMessagesDish.findByIdError(id, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    };

    async update(id: string, dish: PatchDishInput): Promise<IDishPatch | null> {
        try {
           const existingDish = await this.dishModel.findOne({ id });
           if (!existingDish) {
                this.logger.warn(errorMessagesDish.findByIdNotFound(id));
                return null;
           };

           const updateDish = await this.dishModel.findOneAndUpdate(
            { id },
            { ...dish },
            { new: true }
           ).exec();

           this.logger.log(errorMessagesDish.updateSuccess(id));

           return updateDish as IDishPatch;
        } catch (error) {
            this.logger.error(errorMessagesDish.updateError(id, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };

    async delete(id: string): Promise<boolean>{
        try {
            const existingDish = await this.dishModel.findOne({ id });
            if (!existingDish) {
                this.logger.warn(errorMessagesDish.findByIdNotFound(id));
                return false;
            };

            await this.dishModel.deleteOne({ id }).exec();
            this.logger.log(errorMessagesDish.deleteSuccess(id));
            return true;
        }catch (error){
            this.logger.error(errorMessagesDish.deleteError(id, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };
}