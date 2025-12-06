import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import  type { IDishPatch, IDishRepository } from "./domain/interface";
import  type { DishInput, PatchDishInput, ILogger } from "libs/domain/src";
import { IDish } from "./domain/interface";
import { ErrorAdapter, errorMessagesCode, errorMessagesDish, errorMessagesGlobal } from "libs/infraestructure/src";

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

        this.logger.log(errorMessagesDish.createDishSuccess);
        return createdDish as IDish;
      } catch (error) {
        if (error.message === errorMessagesCode) {
          this.logger.warn(errorMessagesDish.createNameDuplicate(dish.name));
          throw new ConflictException(errorMessagesDish.createNameDuplicate(dish.name));
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
      };
    };

    async findAll(): Promise<IDish[]> {
      try {
        const dishes = await this.dishRepository.findAll();

        this.logger.log(errorMessagesDish.findAllSuccess(dishes.length));
        return dishes as IDish[];
      } catch (error) {
        if (error.message === errorMessagesCode.DATABASE_ERROR) {
          this.logger.error(errorMessagesGlobal.databaseError);
          throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };

        this.logger.error(errorMessagesGlobal.unexpectedError);
        throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
      };
    };
  
    async findById(id: string): Promise<IDish | null> {
        try {
          const dish = await this.dishRepository.findById(id);

          if (!dish) throw new NotFoundException(errorMessagesDish.findByIdNotFound(id));

          this.logger.log(errorMessagesDish.findByIdSuccess(id));
          return dish as IDish;
        } catch (error) {
          if (error.message === errorMessagesCode.DATABASE_ERROR) {
            this.logger.error(errorMessagesGlobal.databaseError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
          };

          if (error instanceof NotFoundException) throw error;
    
          this.logger.error(errorMessagesGlobal.unexpectedError);
          throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };

    async update(id: string, dish: PatchDishInput): Promise<IDishPatch> {
      try {
        const updatedDish = await this.dishRepository.update(id, dish);
  
        if (!updatedDish) throw new NotFoundException(errorMessagesDish.findByIdNotFound(id));
  
        this.logger.log(errorMessagesDish.updateSuccess(id));
        return updatedDish as IDishPatch;
      } catch (error) {
        if (error.message === errorMessagesCode.DATABASE_ERROR) {
          this.logger.error(errorMessagesGlobal.databaseError);
          throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };

        if (error instanceof NotFoundException) throw error;

        this.logger.error(errorMessagesGlobal.unexpectedError);
        throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
      };
    };

    async delete(id: string): Promise<{ message: string }> {
      try {
        const deleted = await this.dishRepository.delete(id);
        if (!deleted) throw new NotFoundException(errorMessagesDish.findByIdNotFound(id));

        this.logger.log(errorMessagesDish.deleteSuccess(id));
        return { message: errorMessagesDish.deleteDishSuccess };
      } catch (error) {
        if (error.message === errorMessagesCode.DATABASE_ERROR) {
          this.logger.error(errorMessagesGlobal.databaseError);
          throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };

        if (error instanceof NotFoundException) throw error;

        this.logger.error(errorMessagesGlobal.unexpectedError);
        throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
      };
    };
}