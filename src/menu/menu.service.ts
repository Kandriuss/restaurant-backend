import { 
    Inject, 
    Injectable, 
    InternalServerErrorException, 
    NotFoundException, 
    BadRequestException 
} from '@nestjs/common';
import type { ILogger, IMenu, MenuInput, MenuPatchInput } from 'libs/domain/src';
import type { IMenuRepository } from './domain';
import type { IDishRepository } from 'src/dish/domain';
import { IFullMenu } from './domain/interface/full-menu.interface';
import { IMenuPatch } from './domain';
import { errorMessagesMenu , errorMessagesDish, errorMessagesCode, errorMessagesGlobal } from 'libs/infraestructure/src';


@Injectable()
export class MenuService {
    constructor(
        @Inject('MenuRepository')
        private readonly menuRepository: IMenuRepository,
        @Inject('LoggerService')
        private readonly logger: ILogger,
        @Inject('DishRepository')
        private readonly dishRepository: IDishRepository,
    ) {}

    async create(menu: MenuInput): Promise<IMenu> {
        try {
            for (const plateId of menu.plate) {
                const dish = await this.dishRepository.findById(plateId);
                if (!dish) {
                    this.logger.warn( errorMessagesDish.findByIdNotFound(plateId) );
                    throw new BadRequestException( errorMessagesDish.findByIdNotFound(plateId) );
                }
            }

            const existingMenu = await this.menuRepository.findByDate(menu.date);
            if (existingMenu) {
                this.logger.warn( errorMessagesMenu.findByDateNotFound(menu.date) );
                throw new BadRequestException( errorMessagesMenu.createDateDuplicate(menu.date) );
            }

            const newMenu = await this.menuRepository.create(menu);
            this.logger.log( errorMessagesMenu.createSuccess);
            return newMenu;
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error( errorMessagesMenu.createError(error.message) );
                throw new InternalServerErrorException( errorMessagesGlobal.internalServerError );
            }
            this.logger.error( errorMessagesGlobal.unexpectedError, error.stack );
            throw new InternalServerErrorException( errorMessagesGlobal.internalServerError );   
        }
    }

    async getCurrentMenu(): Promise<IFullMenu> {
        try {
            const menu = await this.menuRepository.getCurrentMenu();
            if (!menu) { throw new NotFoundException( errorMessagesMenu.getCurrentMenuNotFound )};

            this.logger.log( errorMessagesMenu.getCurrentMenuSuccess);
            return menu as unknown as IFullMenu;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            if (error.message === errorMessagesCode.DATABASE_ERROR) { 
                throw new InternalServerErrorException( errorMessagesGlobal.internalServerError )
            };

            this.logger.error( errorMessagesGlobal.unexpectedError, error.stack );
            throw new InternalServerErrorException( errorMessagesGlobal.internalServerError );
        }
    }

    async updateCurrentMenu(menu: MenuPatchInput): Promise<IMenuPatch> {
        try {
            const updated = await this.menuRepository.updateCurrentMenu(menu);
    
            if (!updated) {
                throw new NotFoundException( errorMessagesMenu.NotFoundException );
            };
    
            this.logger.log( errorMessagesMenu.updateSuccess );   
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
    
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                throw new InternalServerErrorException( errorMessagesGlobal.internalServerError );
            };
    
            this.logger.error( errorMessagesGlobal.unexpectedError, error.stack );
            throw new InternalServerErrorException( errorMessagesGlobal.internalServerError );
        }
    }
    
    async findByDate(date: Date): Promise<IFullMenu> {
        try {
            const menu = await this.menuRepository.findByDate(date);
            if (!menu) {
                this.logger.warn(`No se encontró menú para la fecha: ${date.toISOString().slice(0, 10)}`);
                throw new NotFoundException(`No existe menú para la fecha ${date.toISOString().slice(0, 10)}`);
            }
            this.logger.log(`Menú encontrado para la fecha: ${date.toISOString().slice(0, 10)}`);
            return menu;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (error.message === errorMessagesCode.DATABASE_ERROR) {   
                this.logger.error( errorMessagesGlobal.databaseError, error.stack );   
                throw new InternalServerErrorException( errorMessagesGlobal.internalServerError );
            }
            this.logger.error( errorMessagesGlobal.unexpectedError, error.stack );
            throw new InternalServerErrorException( errorMessagesGlobal.internalServerError );
        }
    }

    async delete(id: string): Promise<{ message: string }> {
        try {
            const deleted = await this.menuRepository.delete(id);
            if (!deleted) { throw new NotFoundException( errorMessagesMenu.findByIdNotFound(id) )};
            this.logger.log( errorMessagesMenu.deleteSuccess(id) );
            return { message: errorMessagesMenu.deleteSuccess(id) };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (error.message === errorMessagesCode.DATABASE_ERROR) { throw new InternalServerErrorException( errorMessagesGlobal.internalServerError )};
            this.logger.error( errorMessagesGlobal.unexpectedError, error.stack );
            throw new InternalServerErrorException( errorMessagesGlobal.internalServerError );
        }
    }
}
