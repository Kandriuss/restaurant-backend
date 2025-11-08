import { IDishPatch } from "./dish-patch.interface";
import { IDish } from "../../../../libs/domain/src/interfaces/dish/dish.interface";
import { DishInput, PatchDishInput } from "libs/domain/src";

export interface IDishRepository {
    create(dish: DishInput): Promise<IDish>;
    findAll(): Promise<IDish[]>;
    findById(id: string): Promise<IDish | null>;
    update(id: string, dish: PatchDishInput): Promise<IDishPatch | null>;
    delete(id: string): Promise<boolean>;
}