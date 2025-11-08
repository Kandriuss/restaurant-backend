import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import type { PatchRoleInput, RoleInput } from 'libs/domain/src';
import { Roles } from 'libs/infraestructure/src';
import { ERole } from 'libs/domain/src/enum';
import { JwtAuthGuard } from 'libs/infraestructure/src';
import { RolesGuard } from 'libs/infraestructure/src';
@Controller('roles')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    //Crear un nuevo rol
    // @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ERole.ADMIN)
    @Post('')
    async create(@Body() role: RoleInput){
        return await this.roleService.create(role);
    }

    //Ver todos los roles
    // @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ERole.ADMIN)
    @Get('')
    async getAll(){
        return await this.roleService.getAll();
    }

    //Acceder rol por Id
    @Get(':id')
    async getById(
        @Param('id') id:string) {
        return await this.roleService.getById(id);
    }

    //Acceder a rol por Code
    @Get('role/:code')
    async getByCode(
        @Param('code') code: string){
            return await this.roleService.getByCode(code)
        }
    //Actualziar un Rol
    @Patch(':id')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ERole.ADMIN)
    async update(
        @Param('id') id:string,
        @Body() role: PatchRoleInput
    ){
        return await this.roleService.update(id, role);
    }

    //Eliminar un rol 
    // @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ERole.ADMIN)
    @Delete(':id')
    async delete(@Param('id') id:string){
        return await this.roleService.delete(id)
    }
}
