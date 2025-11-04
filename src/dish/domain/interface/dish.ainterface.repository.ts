import { IDishPatch } from "./dish-patch.interface";
import { IDish } from "./dish.interface";
import { DishInput, PatchDishInput } from "libs/domain/src";

export interface IDishRepository {
    create(dish: DishInput): Promise<IDish | void>;
    findAll(): Promise<IDish[]>;
    findById(id: string): Promise<IDish | void>;
    update(id: string, dish: PatchDishInput): Promise<IDishPatch | null>;
    //updatePrice(id: string, price: number): Promise<IDish | void>;
    // delete(id: string): Promise<void>;
}