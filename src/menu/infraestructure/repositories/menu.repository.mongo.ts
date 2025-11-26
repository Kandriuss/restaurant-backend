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
import { errorMessagesMenu, errorMessagesCode } from "libs/infraestructure/src";

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
            this.logger.error(errorMessagesMenu.createError(error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
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
                this.logger.warn(errorMessagesMenu.findByIdNotFound(id));
                return null;
            }

            if (menu.plate.length !== menu.plateIds.length) {
                const missingPlates = menu.plateIds.filter(
                    (plateId) => !menu.plate.some((dish) => dish.id === plateId),
                );
                if (missingPlates.length) {
                    this.logger.warn(
                        errorMessagesMenu.findByIdMissingPlates(missingPlates.join(', ')),
                    );
                }
            }

            this.logger.log(errorMessagesMenu.findByIdSuccess(menu.id));

            const { plateIds: _, ...menuWithoutIds } = menu;
            return menuWithoutIds;
        } catch (error) {
            this.logger.error(errorMessagesMenu.findByIdError(id, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
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
                this.logger.warn(errorMessagesMenu.findByDateNotFound(new Date(startOfDay.toISOString())));
                return null;
            };

            if (menu.plate.length !== menu.plateIds.length) {
                const missingPlates = menu.plateIds.filter(
                    (plateId) => !menu.plate.some((dish) => dish.id === plateId),
                );
                this.logger.warn(
                    errorMessagesMenu.findByIdMissingPlates(missingPlates.join(', ')),
                );
            };

            this.logger.log(errorMessagesMenu.findByDateSuccess(menu.id, menu.date.toISOString()));

            const { plateIds: _, ...menuWithoutIds } = menu;
            return menuWithoutIds;
        } catch (error) {
            this.logger.error(errorMessagesMenu.findByDateError(error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
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
            this.logger.error(errorMessagesMenu.getCurrentMenuError(error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    }
    
    async updateCurrentMenu(menu: MenuPatchInput): Promise<IMenuPatch | null> {
        try {
            const currentMenu = await this.menuModel.findOne({ isCurrent: true }).exec();
    
            if (!currentMenu) {
                this.logger.warn(errorMessagesMenu.getCurrentMenuNotFound);
                return null; 
            };
    
            Object.assign(currentMenu, menu);
            const updated = await currentMenu.save();
            this.logger.log(errorMessagesMenu.updateCurrentMenuSuccess(updated.id, updated.date.toISOString()));
            return updated as unknown as IMenuPatch;
        } catch (error) {
            this.logger.error(errorMessagesMenu.updateCurrentMenuError(error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    }
    
    
    async delete(id: string): Promise<boolean> {
        try {
            const result = await this.menuModel.deleteOne({ id }).exec();
            if (result.deletedCount === 0) {
                this.logger.warn(errorMessagesMenu.findByIdNotFound(id));
                return false;
            }
            this.logger.log(errorMessagesMenu.deleteSuccess(id));
            return true;
        } catch (error) {
            this.logger.error(errorMessagesMenu.deleteError(id, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    }
}