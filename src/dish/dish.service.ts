import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import  type { IDishPatch, IDishRepository } from "./domain/interface";
import  type { DishInput, PatchDishInput, ILogger } from "libs/domain/src";
import { IDish } from "./domain/interface";
import { ErrorAdapter } from "libs/infraestructure/src";

@Injectable()
export class DishService {
    constructor(
        @Inject('DishRepository')
        private readonly dishRepository: IDishRepository,
        @Inject('LoggerService')
        private readonly logger: ILogger
    ){}

    async create(dish: DishInput): Promise<IDish> {
      try {
        const createdDish = await this.dishRepository.create(dish);
        this.logger.log('Plato creado exitosamente');

        return createdDish as IDish;
      } catch (error) {
        if (error.message === 'DUPLICATE_ENTRY') {
          this.logger.warn(`Intento de crear plato duplicado`);
          throw new ConflictException('Ya existe un plato con ese nombre');
        };

        if (error.message === 'DATABASE_ERROR') {
          this.logger.error(`Error de base de datos al crear el plato`);
          throw new InternalServerErrorException('Error interno del servidor');
        };

        if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
          throw error;
        };

        this.logger.error(`Error inesperado al crear el plato`, error.stack);
        throw new InternalServerErrorException('Error interno del servidor');
      };
    };

    async findAll(): Promise<IDish[]> {
      try {
        this.logger.log('Obteniendo todos los platos');
        return await this.dishRepository.findAll();
      } catch (error) {
        if (error.message === 'DATABASE_ERROR') {
          this.logger.error(`Error de base de datos al obtener todos los platos`);
          throw new InternalServerErrorException('Error interno del servidor');
        };
        if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
          throw error;
        };
        this.logger.error(`Error inesperado al obtener todos los platos`, error.stack);
        throw new InternalServerErrorException('Error interno del servidor');
      };
    };
  
    async findById(id: string): Promise<IDish | null> {
        try {
          const dish = await this.dishRepository.findById(id);

          if (!dish) {
            this.logger.warn(`Plato con ID ${id} no encontrado`);
            throw new NotFoundException(`Plato con el ID ${id} no encontrado`);
          };
    
          return dish;
          
        } catch (error) {
          if (error.message === 'DATABASE_ERROR') {
            this.logger.error(`Error de base de datos al obtener plato con ID: ${id}`);
            throw new InternalServerErrorException('Error interno del servidor');
          }
    
          if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
            throw error;
          }
    
          this.logger.error(`Error inesperado al obtener el plato con ID: ${id}`, error.stack);
          throw new InternalServerErrorException('Error interno del servidor');
        };
    };

    async update(id: string, dish: PatchDishInput): Promise<IDishPatch> {
      try {
        const updatedDish = await this.dishRepository.update(id, dish);
  
        if (!updatedDish) {
          this.logger.warn(`Plato con ID ${id} no encontrado`);
          throw new NotFoundException(`Plato con el ID ${id} no encontrado`);
        };
  
        return updatedDish;

      } catch (error) {
        if (error.message === 'DATABASE_ERROR') {
          this.logger.error(`Error de base de datos al actualizar el plato con ID: ${id}`);
          throw new InternalServerErrorException('Error interno del servidor');
        };
        if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
          throw error;
        };
        this.logger.error(`Error inesperado al actualizar el plato con ID: ${id}`, error.stack);
        throw new InternalServerErrorException('Error interno del servidor');
      };
    };

    async delete(id: string): Promise<{ message: string }> {
      try {
        const existingDish = await this.dishRepository.findById(id);
    
        if (!existingDish) {
          this.logger.warn(`Plato con ID ${id} no encontrado`);
          throw new NotFoundException(`Plato con el ID ${id} no encontrado`);
        }
    
        const deleted = await this.dishRepository.delete(id);
        if (!deleted) {
          throw new NotFoundException(`No se pudo eliminar el plato con ID ${id}`);
        }
    
        this.logger.log(`Plato con ID ${id} eliminado exitosamente`);
        return { message: 'Plato eliminado exitosamente' };
      } catch (error) {
        if (error.message === 'DATABASE_ERROR') {
          this.logger.error(`Error de base de datos al eliminar el plato con ID: ${id}`);
          throw new InternalServerErrorException('Error interno del servidor');
        };
        if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
          throw error;
        };
        this.logger.error(`Error inesperado al eliminar el plato con ID: ${id}`, error.stack);
        throw new InternalServerErrorException('Error interno del servidor');
      };
    };
}