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
    
    @Post('register')
    async createUser(@Body(new ZodValidationPipe(CreateUserZ)) user: z.infer<typeof CreateUserZ>){
        return await this.userService.createByClient(user)
    };

    @Post('admin')
    async createByAdmin(@Body(new ZodValidationPipe(AdminCreateUserZ)) user: z.infer<typeof AdminCreateUserZ>){
        return this.userService.createByAdmin(user);
    }

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(ERole.ADMIN)
    @Get()
    async getAllUsers(): Promise<IUserFull[]>{
        return await this.userService.findAll();
    }
    
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(ERole.ADMIN)
    @Get(':id')
    async getById(
        @Param('id') id: string){
        return await this.userService.findById(id)
    }

 
    @Patch(':id')
    // @UseGuards(JwtAuthGuard)
    async update(
        @Body() user: PatchUserInput,
        @Param('id') id: string
    ){
        return this.userService.update(user,id)
    }

    @Patch('change-password/:id')
    // @UseGuards(JwtAuthGuard)
    async updatePassword(
        @Param('id') id:string,
        @Body(new ZodValidationPipe(PatchPasswordZ)) userPass: PatchPasswordInput
    ){
        return await this.userService.updatePassword(id, userPass)
    }

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(ERole.ADMIN)
    @Delete(':id')
    async delete(@Param('id') id: string){
        return await this.userService.delete(id)
    }
}
