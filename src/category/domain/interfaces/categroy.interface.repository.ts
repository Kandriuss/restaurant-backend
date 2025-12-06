import { ICategory } from "libs/domain/src/interfaces/category/category.interface"
import { CategoryInput, PatchCategoryInput } from "libs/domain/src/schemas"
import { IPatchCategory } from "./patch-category.interface"

export interface ICategoryRepository {
    create(category: CategoryInput): Promise<ICategory>
    findAll(): Promise<ICategory[]>
    findById(id: string): Promise<ICategory | null>
    findByCode(code: string): Promise<ICategory | null>
    update(id: string, category: PatchCategoryInput): Promise<IPatchCategory | null>
    delete(id:string): Promise<boolean>
}