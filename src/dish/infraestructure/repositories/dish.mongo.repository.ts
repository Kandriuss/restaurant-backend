import {Injectable, Inject, BadRequestException, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import {InjectModel} from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { DishInput, Dishes, PatchDishInput } from "libs/domain/src";
import type { ILogger } from 'libs/domain/src'
import { IDishRepository, IDishPatch } from "src/dish/domain/interface";
import { IDish } from "src/dish/domain/interface";
import { errorUtil } from "node_modules/zod/v3/helpers/errorUtil.cjs";

const COLLECTION_NAME = 'dishes';

@Injectable()
export class DishMongoRepository implements IDishRepository {
    constructor(
        @InjectModel(Dishes.name) private readonly dishModel: Model <Dishes>,
        @Inject('LoggerService') private readonly logger: ILogger,
    ){}

    async create(dish: DishInput): Promise<IDish | void> {
        try {
            const id = uuidv4();
            const existingDish = await this.dishModel.findOne({ name: dish.name });
            if (existingDish){
                this.logger.warn(`Intento de crear plato con nombre duplicado: ${dish.name}`);
                throw new BadRequestException(`El nombre ${dish.name} ya existe`);
            }

            const newDish = new this.dishModel({
                ...dish,
                id,
                active: true
            });

            await newDish.save();

            this.logger.log(`Plato creado exitosamente con ID: ${id} y nombre: ${dish.name}`);

            return newDish as IDish;

        } catch (error) {
            this.logger.error(`Error técnico al crear el plato: ${dish?.name ?? 'desconocido'}`, error?.stack);
            throw new Error('DATABASE_ERROR');
        };
    };

    async findAll(): Promise<IDish[]> {
        try {
            const dishes = await this.dishModel.find();

            return dishes as IDish[];

        } catch (error) {
            this.logger.error('Error técnico al obtener los platos', error?.stack);
            throw new Error('DATABASE_ERROR');
        }
    };

    async findById(id: string): Promise<IDish | void> {
        try {
            const dish = await this.dishModel.findOne({ id }).exec();
            if (!dish) {
                this.logger.warn(`Plato con ID ${id} no encontrado`);
                return undefined;
            };
            this.logger.log(`Plato encontrado con ID: ${id}`);

             return dish as IDish;
          
        } catch (error) {
            this.logger.error(`Error al acceder a la base de datos: ${error.message}`);
            throw new Error('DATABASE_ERROR');
        }
    };

    async update(id: string, dish: PatchDishInput): Promise<IDishPatch> {
        try {
           const existingDish = await this.dishModel.findOne({ id });

           if (!existingDish) {
                this.logger.warn(`Intento de actualizar plato inexistente con ID: ${id}`);
           };

           const updateDish = await this.dishModel.findOneAndUpdate(
            { id },
            { ...dish },
            { new: true }
           ).exec();

           this.logger.log(`Plato actualizado exitosamente con ID: ${id}`);

           return updateDish as IDishPatch;

        } catch (error) {
            this.logger.error(`Error al actualizar el plato: ${id}`, error?.stack);
            throw new Error('DATABASE_ERROR');
        };
    };

    async delete(id: string): Promise<boolean>{
        try {
            const result = await this.dishModel.deleteOne({ id }).exec();

            this.logger.log(`Plato eliminado exitosamente con ID: ${id}`);
            
            return result.deletedCount > 0;
            
        }catch (error){
            this.logger.error(`Error al eliminar el plato: ${id}`, error?.stack);
            throw new Error('DATABASE_ERROR');
        };
    };
}