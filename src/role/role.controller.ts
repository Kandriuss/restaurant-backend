import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from 'libs/application/src';
import { Roles } from 'libs/infraestructure/src';
import { JwtAuthGuard } from 'libs/infraestructure/src';
import { RolesGuard } from 'libs/infraestructure/src';
import { RoleService } from './role.service';
import type { PatchRoleInput, RoleInput } from 'libs/domain/src';
import { PatchRoleZ, RoleZ } from 'libs/domain/src';
import { ERole } from 'libs/domain/src/enum';


@Controller('roles')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    //Crear un nuevo rol
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(ERole.ADMIN)
    @Post('')
    async create(@Body(new ZodValidationPipe(RoleZ)) role: z.infer<typeof RoleZ>){
        return await this.roleService.create(role);
    }

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(ERole.ADMIN)
    @Get('')
    async getAll(){
        return await this.roleService.findAll();
    }

    //Acceder rol por Id
    @Get(':id')
    async getById(
        @Param('id') id:string) {
        return await this.roleService.findById(id);
    }

    //Acceder a rol por Code
    @Get('role/:code')
    async getByCode(
        @Param('code') code: string){
            return await this.roleService.findByCode(code)
        }
    //Actualziar un Rol
    @Patch(':id')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(ERole.ADMIN)
    async update(
        @Param('id') id:string,
        @Body(new ZodValidationPipe(PatchRoleZ)) role: z.infer<typeof PatchRoleZ>
    ){
        return await this.roleService.update(id, role);
    }

    //Eliminar un rol 
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(ERole.ADMIN)
    @Delete(':id')
    async delete(@Param('id') id:string){
        return await this.roleService.delete(id)
    }
}
