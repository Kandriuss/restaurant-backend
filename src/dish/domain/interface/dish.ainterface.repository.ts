import { IDish } from "./dish.interface";
import { DishInput } from "libs/domain/src";

export interface IDishRepository {
    create(dish: DishInput): Promise<IDish | void>;
    // findAll(): Promise<IDish[]>;
    // findById(id: string): Promise<IDish>;
    // update(id: string, dish: DishInput): Promise<IDish | void>;
    // delete(id: string): Promise<void>;
}