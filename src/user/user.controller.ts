import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards} from '@nestjs/common';
import { AdminCreateUserZ, CreateUserZ, UserInput, IUserFull, UserFullZ, PatchUserZ, PatchPasswordZ } from './domain';
import { UserService } from 'src/user/user.service';
import { z } from 'zod'
import { ERole } from 'libs/domain/src/enum';
import { ZodValidationPipe } from 'libs/application/src/pipes';
import type {PatchPasswordInput, PatchUserInput} from './domain'
import { JwtAuthGuard, RolesGuard, Roles } from 'libs/infraestructure/src/security';
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}
    
    //Registrar usuario cliente
    @Post('register')
    async createUser(@Body(new ZodValidationPipe(CreateUserZ)) user: z.infer<typeof CreateUserZ>){
        return await this.userService.createUser(user)
    };

    //Crear usuario administrador
    @Post('admin')
    async createByAdmin(@Body(new ZodValidationPipe(AdminCreateUserZ)) user: z.infer<typeof AdminCreateUserZ>){
        return this.userService.createByAdmin(user);
    }

    //Acceder a todos los usuarios
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(ERole.ADMIN)
    @Get()
    async getAllUsers(): Promise<IUserFull[]>{
        return await this.userService.getAll();
    }
    
    //Acceder a los usuarios por Id
    // @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ERole.ADMIN)
    @Get(':id')
    async getById(@Param('id') id: string): Promise<IUserFull>{
        return await this.userService.getById(id)
    }

    //Actualizar al usuario 
    @Patch(':id')
    // @UseGuards(JwtAuthGuard)
    async update(
        @Body() user: PatchUserInput,
        @Param('id') id: string
    ){
        return this.userService.update(user,id)
    }

    //Actualziar contraseña 
    @Patch('change-password/:id')
    // @UseGuards(JwtAuthGuard)
    async updatePassword(
        @Param('id') id:string,
        @Body(new ZodValidationPipe(PatchPasswordZ)) userPass: PatchPasswordInput
    ){
        return await this.userService.updatePassword(id, userPass)
    }

    //Eliminar usuario
    // @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ERole.ADMIN)
    @Delete(':id')
    async delete(@Param('id') id: string){
        return await this.userService.delete(id)
    }
}
