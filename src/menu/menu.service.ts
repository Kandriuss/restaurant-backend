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
                    this.logger.warn(`Plato no encontrado: ${plateId}`);
                    throw new BadRequestException(`Plato con ID ${plateId} no encontrado`);
                }
            }

            const existingMenu = await this.menuRepository.findByDate(menu.date);
            if (existingMenu) {
                this.logger.warn(`Menú ya existe para la fecha: ${menu.date}`);
                throw new BadRequestException(`Ya existe un menú para la fecha ${menu.date.toISOString().slice(0, 10)}`);
            }

            const newMenu = await this.menuRepository.create(menu);
            this.logger.log(`Menú creado exitosamente con ID: ${newMenu.id}`);
            return newMenu;
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error('Error de base de datos al crear el menú', error.stack);
                throw new InternalServerErrorException('Error interno del servidor');
            }
            this.logger.error('Error inesperado al crear el menú', error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        }
    }

    async getCurrentMenu(): Promise<IFullMenu> {
        try {
            const menu = await this.menuRepository.getCurrentMenu();
            if (!menu) { throw new NotFoundException(`No se encontró menú actual`)};

            this.logger.log(`Menú actual encontrado exitosamente`);
            return menu as unknown as IFullMenu;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            if (error.message === 'DATABASE_ERROR') { 
                throw new InternalServerErrorException('Error interno del servidor')
            };

            this.logger.error(`Error inesperado al buscar el menú actual`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        }
    }

    async updateCurrentMenu(menu: MenuPatchInput): Promise<IMenuPatch> {
        try {
            const updated = await this.menuRepository.updateCurrentMenu(menu);
    
            if (!updated) {
                throw new NotFoundException('No existe un menú actual para actualizar');
            };
    
            this.logger.log('Menú actual actualizado correctamente');
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
    
            if (error.message === 'DATABASE_ERROR') {
                throw new InternalServerErrorException('Error interno del servidor');
            };
    
            this.logger.error('Error inesperado al actualizar menú actual', error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
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
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al buscar el menú por fecha`, error.stack);
                throw new InternalServerErrorException('Error interno del servidor');
            }
            this.logger.error(`Error inesperado al buscar el menú por fecha`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        }
    }

    async delete(id: string): Promise<{ message: string }> {
        try {
            const deleted = await this.menuRepository.delete(id);
            if (!deleted) { throw new NotFoundException(`Menú con ID ${id} no encontrado`)};
            this.logger.log(`Menú eliminado exitosamente con ID: ${id}`);
            return { message: 'Menú eliminado exitosamente' };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (error.message === 'DATABASE_ERROR') { throw new InternalServerErrorException('Error interno del servidor')};
            this.logger.error(`Error inesperado al eliminar el menú con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        }
    }
}
