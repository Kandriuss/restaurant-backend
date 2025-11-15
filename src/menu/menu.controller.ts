import { Controller, Post, Get, Patch, Body, Param, BadRequestException, NotFoundException, Delete } from '@nestjs/common';
import { ParseDatePipe, ZodValidationPipe } from 'libs/application/src';
import { MenuService } from './menu.service';
import type { IMenu, MenuInput, MenuPatchInput } from 'libs/domain/src';
import { IFullMenu } from './domain/interface/full-menu.interface';
import { PatchMenuZ } from 'libs/domain/src/schemas';
import { IMenuPatch } from './domain';

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService){}

    @Post('')
    async create(@Body() menu: MenuInput): Promise<IMenu> {
        return await this.menuService.create(menu);
    }

    @Get('day/:date')
    async findByDate(
        @Param('date', ParseDatePipe) date: Date): Promise<IFullMenu> 
        {
        const menu = await this.menuService.findByDate(date);

        if (!menu) {
            throw new NotFoundException(`No existe menú para la fecha ${date.toISOString().slice(0,10)}`);
        }
        return menu;
    }

    @Get('current')
    async getCurrentMenu(): Promise<IFullMenu> {
        return await this.menuService.getCurrentMenu();
    }

    @Patch('current')
    async updateCurrentMenu(
        @Body(new ZodValidationPipe(PatchMenuZ)) body: MenuPatchInput
    ): Promise<IMenuPatch> {
        return await this.menuService.updateCurrentMenu(body);
    }   
    
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
        return await this.menuService.delete(id);
    }
}
