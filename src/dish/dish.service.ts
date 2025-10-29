import { Inject, Injectable } from "@nestjs/common";
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
}