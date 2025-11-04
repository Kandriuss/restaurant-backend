import { Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import  type { IDishRepository } from "./domain/interface/dish.ainterface.repository";
import  type { DishInput, ILogger } from "libs/domain/src";
import { IDish } from "./domain/interface/dish.interface";

@Injectable()
export class DishService {
    constructor(
        @Inject('DishRepository')
        private readonly dishRepository: IDishRepository,
        @Inject('LoggerService')
        private readonly logger: ILogger
    ){}

    async create(dish: DishInput): Promise<IDish | void> {
        return await this.dishRepository.create(dish);
    }

    async findAll(): Promise<IDish[]> { 
        return await this.dishRepository.findAll();
    }

    
    async findById(id: string): Promise<IDish> {
        try {
          const dish = await this.dishRepository.findById(id);
    
          if (!dish) {
            this.logger.warn(`Plato con ID ${id} no encontrado`);
            throw new NotFoundException(`Plato con el ID ${id} no encontrado`);
          }
    
          return dish;
        } catch (error) {
          if (error.message === 'DATABASE_ERROR') {
            this.logger.error(`Error de base de datos al obtener plato con ID: ${id}`);
            throw new InternalServerErrorException('Error interno del servidor');
          }
    
          // Si el error ya es una excepción HTTP, la dejamos pasar
          if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
            throw error;
          }
    
          this.logger.error(`Error inesperado al obtener el plato con ID: ${id}`, error.stack);
          throw new InternalServerErrorException('Error interno del servidor');
        }
    }
}