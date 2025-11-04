import {Injectable, Inject, BadRequestException, InternalServerErrorException} from "@nestjs/common";
import {InjectModel} from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { DishInput, Dishes } from "libs/domain/src";
import type { ILogger } from 'libs/domain/src'
import { IDishRepository } from "src/dish/domain/interface/dish.ainterface.repository";
import { IDish } from "src/dish/domain/interface/dish.interface";

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
            // Si ya es una excepción conocida (BadRequestException), la re-lanzamos directamente
            if (error instanceof BadRequestException) {
                throw error;
            }
            
            // Para errores técnicos de la base de datos, logueamos y lanzamos excepción genérica
            this.logger.error(`Error técnico al crear el plato: ${dish?.name ?? 'desconocido'}`, error?.stack);
            throw new InternalServerErrorException('Error interno al crear el plato');
        }
    }

    async findAll(): Promise<IDish[]> {
        try {
            const dishes = await this.dishModel.find();
            return dishes as IDish[];
        } catch (error) {
            this.logger.error('Error técnico al obtener los platos', error?.stack);
            throw new InternalServerErrorException('Error interno al obtener los platos');
        }
    }

    async findById(id: string): Promise<IDish | void> {
        try {
          const dish = await this.dishModel.findOne({ id }).exec();
          this.logger.log(`findById ejecutado con id=${id}`);
          return dish as IDish;
        } catch (error) {
          this.logger.error(`Error al acceder a la base de datos: ${error.message}`);
          throw new Error('DATABASE_ERROR');
        }
    }
}