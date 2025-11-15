import { IMenu, MenuInput } from "libs/domain/src";
import { IFullMenu, IMenuPatch } from "./";
import { MenuPatchInput } from "libs/domain/src/schemas";

export interface IMenuRepository {
    create(menu: MenuInput): Promise<IMenu>; 
    findByDate(date: Date): Promise<IFullMenu | null>; // Buscar menú por fecha
    getCurrentMenu(): Promise<IFullMenu | null>; // Buscar menú actual
    updateCurrentMenu(menu: MenuPatchInput): Promise<IMenuPatch | null>; // Actualizar menú actual
    delete(id: string): Promise<boolean>;
}