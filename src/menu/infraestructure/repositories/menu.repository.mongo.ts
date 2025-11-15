import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage } from "mongoose";
import { MenuDocument } from "libs/domain/src";
import { IMenuRepository } from "src/menu/domain";
import { MenuPatchInput } from "libs/domain/src";
import type { ILogger, IMenu, MenuInput } from "libs/domain/src";
import { Menus } from "libs/domain/src/models";
import { v4 as uuidv4 } from 'uuid';
import { IFullMenu } from "src/menu/domain/interface/full-menu.interface";
import { IMenuPatch } from "src/menu/domain";

const COLLECTION_NAME = 'menus';
const DISH_COLLECTION_NAME = 'dishes';

@Injectable()
export class MenuMongoRepository implements IMenuRepository {
    constructor(
        @InjectModel(Menus.name) private readonly menuModel: Model<MenuDocument>,
        @Inject('LoggerService') private readonly logger: ILogger,
    ){}

    async create(menu: MenuInput): Promise<IMenu> {
        try {
            const id = uuidv4();
            const newMenu = new this.menuModel({ ...menu, id });
            
            await newMenu.save();
            return newMenu as unknown as IMenu;
        } catch (error) {
            this.logger.error(`Error al crear el menú`, error.stack);
            throw new Error('DATABASE_ERROR');
        }
    }

    async findById(id: string): Promise<IFullMenu | null> {
        try {
            const pipeline: PipelineStage[] = [
                {
                    $match: {
                        id,
                    },
                },
                {
                    $lookup: {
                        from: DISH_COLLECTION_NAME,
                        localField: 'plate',
                        foreignField: 'id',
                        as: 'plateDetails',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        date: 1,
                        plateIds: '$plate',
                        plate: {
                            $map: {
                                input: '$plateDetails',
                                as: 'dish',
                                in: {
                                    id: '$$dish.id',
                                    name: '$$dish.name',
                                    description: '$$dish.description',
                                    price: '$$dish.price',
                                    image: '$$dish.image',
                                },
                            },
                        },
                    },
                },
            ];

            type AggregatedMenu = IFullMenu & { plateIds: string[] };
            const [menu] = await this.menuModel.aggregate<AggregatedMenu>(pipeline).exec();

            if (!menu) {
                this.logger.warn(`No se encontró menú con ID: ${id}`);
                return null;
            }

            if (menu.plate.length !== menu.plateIds.length) {
                const missingPlates = menu.plateIds.filter(
                    (plateId) => !menu.plate.some((dish) => dish.id === plateId),
                );
                if (missingPlates.length) {
                    this.logger.warn(
                        `Faltan los platos asociados a los IDs: ${missingPlates.join(', ')}`,
                    );
                }
            }

            this.logger.log(`Menú encontrado con ID: ${menu.id}`);

            const { plateIds: _, ...menuWithoutIds } = menu;
            return menuWithoutIds;
        } catch (error) {
            this.logger.error(`Error al buscar el menú por ID`, error.stack);
            throw new Error('DATABASE_ERROR');
        }
    }

    async findByDate(date: Date): Promise<IFullMenu | null> {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            this.logger.log(
                `Buscando menú entre ${startOfDay.toISOString()} y ${endOfDay.toISOString()}`,
            );

            const pipeline: PipelineStage[] = [
                {
                    $match: {
                        date: { $gte: startOfDay, $lte: endOfDay },
                    },
                },
                { $sort: { date: 1 } },
                { $limit: 1 },
                {
                    $lookup: {
                        from: DISH_COLLECTION_NAME,
                        localField: 'plate',
                        foreignField: 'id',
                        as: 'plateDetails',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        date: 1,
                        plateIds: '$plate',
                        plate: {
                            $map: {
                                input: '$plateDetails',
                                as: 'dish',
                                in: {
                                    id: '$$dish.id',
                                    name: '$$dish.name',
                                    description: '$$dish.description',
                                    price: '$$dish.price',
                                    image: '$$dish.image',
                                },
                            },
                        },
                    },
                },
            ];

            type AggregatedMenu = IFullMenu & { plateIds: string[] };
            const [menu] = await this.menuModel.aggregate<AggregatedMenu>(pipeline).exec();

            if (!menu) {
                this.logger.warn(`No se encontró menú para la fecha ${startOfDay.toISOString()}`);
                return null;
            };

            if (menu.plate.length !== menu.plateIds.length) {
                const missingPlates = menu.plateIds.filter(
                    (plateId) => !menu.plate.some((dish) => dish.id === plateId),
                );
                this.logger.warn(
                    `No se encontraron los platos asociados a los IDs: ${missingPlates.join(', ')}`,
                );
            };

            this.logger.log(`Menú encontrado con ID: ${menu.id} para la fecha ${menu.date.toISOString()}`);

            const { plateIds: _, ...menuWithoutIds } = menu;
            return menuWithoutIds;
        } catch (error) {
            this.logger.error(`Error al buscar menú por fecha`, error.stack);
            throw new Error('DATABASE_ERROR');
        }
    }
    async getCurrentMenu(): Promise<IFullMenu | null> {
        try {
            const pipeline: PipelineStage[] = [
                { $match: { isCurrent: true } },
                { $sort: { date: 1 } },
                { $limit: 1 },
                {
                    $lookup: {
                        from: DISH_COLLECTION_NAME,
                        localField: 'plate',
                        foreignField: 'id',
                        as: 'plateDetails',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        date: 1,
                        plateIds: '$plate',
                        plate: {
                            $map: {
                                input: '$plateDetails',
                                as: 'dish',
                                in: {
                                    id: '$$dish.id',
                                    name: '$$dish.name',
                                    description: '$$dish.description',
                                    price: '$$dish.price',
                                    image: '$$dish.image',
                                },
                            },
                        },
                    },
                },
            ];
    
            const [menu] = await this.menuModel.aggregate(pipeline).exec();
    
            return menu ?? null;
        } catch (error) {
            this.logger.error('Error al obtener menú actual', error.stack);
            throw new Error('DATABASE_ERROR');
        }
    }
    
    async updateCurrentMenu(menu: MenuPatchInput): Promise<IMenuPatch | null> {
        try {
            const currentMenu = await this.menuModel.findOne({ isCurrent: true }).exec();
    
            if (!currentMenu) {
                this.logger.warn('No se encontró menú actual');
                return null; 
            };
    
            Object.assign(currentMenu, menu);
            const updated = await currentMenu.save();
            this.logger.log(`Menú actualizado exitosamente con ID: ${updated.id} para la fecha ${updated.date.toISOString()}`);
            return updated as unknown as IMenuPatch;
        } catch (error) {
            this.logger.error('Error al actualizar el menú actual', error.stack);
            throw new Error('DATABASE_ERROR');
        }
    }
    
    
    async delete(id: string): Promise<boolean> {
        try {
            const result = await this.menuModel.deleteOne({ id }).exec();
            if (result.deletedCount === 0) {
                this.logger.warn(`Intento de eliminar menú inexistente con ID: ${id}`);
                return false;
            }
            this.logger.log(`Menú eliminado exitosamente con ID: ${id}`);
            return true;
        } catch (error) {
            this.logger.error(`Error al eliminar el menú con ID: ${id}`, error.stack);
            throw new Error('DATABASE_ERROR');
        };
    }
}