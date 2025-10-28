import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IUser, UserInput } from './domain';
import type { ILogger } from 'libs/domain/src';
import type { AdminCreateUserZ, CreateUserZ, IPatchUser, IUserRepository, PatchPasswordInput, PatchUserInput } from './domain'
import { z } from 'zod'
import { ERole } from 'libs/domain/src/enum';
import type { IRoleRespository } from 'src/role/domain';
import { IUserFull } from './domain';

@Injectable()
export class UserService {
    constructor(
        @Inject('UserRepository') private readonly userRepository: IUserRepository,
        @Inject('LoggerService') private readonly logger: ILogger,
        @Inject('RoleRepository') private readonly roleRepository: IRoleRespository,
    ){}
    //Metodo para crear usuarios cliente
    async createUser(user: z.infer<typeof CreateUserZ>): Promise<IUser | void> {
        try { 
            return this.userRepository.create(user, ERole.CLIENT) 
    
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            // Loguear el error
            this.logger.error(`Error creando usuario: ${error.message || error}`);
    
            // Errores inesperados
            throw new InternalServerErrorException('Ocurrió un error interno al crear el usuario');
        }
    }

    //Crear usuario Administrador
    async createByAdmin(user: z.infer<typeof AdminCreateUserZ>): Promise<IUser | void> {
        try {
            //Validar que el code del Role exita 
            const existingRole = await this.roleRepository.findByCode(user.roleCode);
            if (!existingRole) {
                this.logger.warn(`El roleCode ${user.roleCode} no existe`);
                throw new BadRequestException(`El roleCode ${user.roleCode} no existe en el sistema`);
            }
            
            return await this.userRepository.create(user, user.roleCode);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            // Loguear el error
            this.logger.error(`Error creando usuario admin: ${error.message || error}`);
    
            // Errores inesperados
            throw new InternalServerErrorException('Ocurrió un error interno al crear el usuario');
        }
    }

    //Acceder a todos los usuarios 
    async getAll(): Promise<IUserFull[]>{
        return await this.userRepository.findAll()
    }

    //Acceder al usuario por el Id
    async getById(id: string): Promise<IUserFull>{
        try{
            const user = await this.userRepository.findById(id);
            return user;
        }catch(error){
            // Si ya es una excepción conocida, la re-lanzamos
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Error al obtener el usuario con el ID: ${id}`);
            throw new InternalServerErrorException('Error interno al obtener el usuario')
        }
    }

    //Acceder al usuario por email
    async getByEmail(email: string): Promise<IUser>{
        try{
            const user = await this.userRepository.findByEmail(email);
            return user as IUser;
        }catch(error){
            // Si ya es una excepción conocida, la re-lanzamos
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Error al obtener el usuario con el email: ${email}`);
            throw new InternalServerErrorException('Error interno al obtener el usuario por email')
        }
    }

    //Actualizar el usuario 
    async update(user: PatchUserInput, id: string): Promise<IPatchUser | void> {
        try {
            // Llamar al repositorio para actualizar
            return await this.userRepository.update(user, id);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
    
            this.logger.error(`Error en servicio al actualizar usuario con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno al actualizar el usuario');
        }
    }
    
    //Actualizar contraseña 
    async updatePassword(id: string, resetPassword: PatchPasswordInput): Promise<boolean> {
        try {
          const result = await this.userRepository.updatePassword(id, resetPassword);
          return result;
        } catch (error) {
          this.logger.error(
            `Error al actualizar contraseña del usuario con Id: ${id}`,
            error.stack,
          );
          throw error;
        }
    }
    
    async delete(id: string): Promise<void> {
        try {
            //Verificar si el usuario existe
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) {
                this.logger.warn(`Usuario con Id: ${id} no encontrado`);
                throw new NotFoundException(`Usuario con Id: ${id} no encontrado`);
            }
            return await this.userRepository.delete(id);
            this.logger.log(`Usuario eliminado exitosamente con ID: ${id}`);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Error al eliminar el usuario con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno al eliminar el usuario');
        }
    }
}
