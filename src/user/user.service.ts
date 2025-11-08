import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
    async createUser(user: z.infer<typeof CreateUserZ>): Promise<IUser> {
        try {
            const createdUser = await this.userRepository.create(user, ERole.CLIENT);

            this.logger.log(`Usuario CLIENTE creado exitosamente`);

            return createdUser as IUser;
    
        } catch (error) {
            if (error.message === 'DUPLICATE_ENTRY_RUT') {
                this.logger.warn(`Intento de crear usuario duplicado`);
                throw new ConflictException('Ya existe un usuario con ese RUT');
            };

            if (error.message === 'DUPLICATE_ENTRY_EMAIL') {
                this.logger.warn(`Intento de crear usuario duplicado`);
                throw new ConflictException('Ya existe un usuario con ese email');
            };

            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al crear el usuario`);
                throw new InternalServerErrorException('Error interno del servidor');
            };

            this.logger.error(`Error inesperado al crear el usuario`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };

    async createByAdmin(user: z.infer<typeof AdminCreateUserZ>): Promise<IUser> {
        try {
            const createdUser = await this.userRepository.create(user, ERole.ADMIN);

            this.logger.log(`Usuario ADMIN creado exitosamente`);

            return createdUser as IUser;

        } catch (error) {
            if (error.message === 'DUPLICATE_ENTRY_RUT') {
                this.logger.warn(`Intento de crear usuario duplicado`);
                throw new ConflictException('Ya existe un usuario con ese RUT');
            };

            if (error.message === 'DUPLICATE_ENTRY_EMAIL') {
                this.logger.warn(`Intento de crear usuario duplicado`);
                throw new ConflictException('Ya existe un usuario con ese email');
            };

            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al crear el usuario`);
                throw new InternalServerErrorException('Error interno del servidor');
            };

            this.logger.error(`Error inesperado al crear el usuario`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };

    async getAll(): Promise<IUserFull[]>{
        try {
            const users = await this.userRepository.findAll();
            this.logger.log(`Usuarios obtenidos exitosamente`);
            return users as IUserFull[];
        }catch(error){
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al obtener todos los usuarios`);
                throw new InternalServerErrorException('Error interno del servidor');
            };
            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`Error inesperado al obtener todos los usuarios`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };

    async getById(id: string): Promise<IUserFull | null>{
        try{
            const user = await this.userRepository.findById(id);
            if(!user) {
                this.logger.warn(`User con el ID ${id} no encontrado`);
                throw new NotFoundException(`User con el ID ${id} no encontrado`);
            };

            this.logger.log(`Usuario encontrado con ID: ${id}`);
            return user as IUserFull;
        }catch(error){
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al obtener el usuario con ID: ${id}`);
                throw new InternalServerErrorException('Error interno del servidor');
            }
            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`Error inesperado al obtener el usuario con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        }
    }

    async getByEmail(email: string): Promise<IUser>{
        try{
            const user = await this.userRepository.findByEmail(email);

            this.logger.log(`Usuario encontrado con email: ${email}`);
            return user as IUser;
        }catch(error){
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al obtener el usuario con email: ${email}`);
                throw new InternalServerErrorException('Error interno del servidor');
            };

            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            };

            this.logger.error(`Error inesperado al obtener el usuario con email: ${email}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        }
    }

    async update(user: PatchUserInput, id: string): Promise<IPatchUser | null> {
        try {  
            const existingUser = await this.userRepository.findById(id);

            if (!existingUser) {
                this.logger.warn(`Usuario con Id: ${id} no encontrado`);
                throw new NotFoundException(`Usuario con Id: ${id} no encontrado`);
            };

            const updatedUser = await this.userRepository.update(user, id);
            this.logger.log(`Usuario actualizado exitosamente con ID: ${id}`);
            return updatedUser as IPatchUser;
        } catch (error) {
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al actualizar el usuario con ID: ${id}`);
                throw new InternalServerErrorException('Error interno del servidor');
            };

            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            };

            this.logger.error(`Error inesperado al actualizar el usuario con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };
    
    async updatePassword(id: string, resetPassword: PatchPasswordInput): Promise<boolean> {
        try {
            const updatedPassword = await this.userRepository.updatePassword(id, resetPassword);

            if (!updatedPassword) {
                this.logger.warn(`Error al actualizar la contraseña del usuario con ID: ${id}`);
                throw new InternalServerErrorException('Error interno del servidor');
            };

            this.logger.log(`Contraseña actualizada exitosamente para el usuario con ID: ${id}`);
            return updatedPassword;
        } catch (error) {
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al actualizar la contraseña del usuario con ID: ${id}`);
                throw new InternalServerErrorException('Error interno del servidor');
            };

            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            };

            this.logger.error(`Error inesperado al actualizar la contraseña del usuario con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    }
    
    async delete(id: string): Promise<boolean> {
        try {
            const existingUser = await this.userRepository.findById(id);

            if (!existingUser) {
                this.logger.warn(`Usuario con Id: ${id} no encontrado`);
                throw new NotFoundException(`Usuario con Id: ${id} no encontrado`);
            };

            const deleted = await this.userRepository.delete(id);
            if (!deleted) {
                throw new NotFoundException(`No se pudo eliminar el usuario con ID ${id}`);
            };

            this.logger.log(`Usuario eliminado exitosamente con ID: ${id}`);
            return true;
        } catch (error) {
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al eliminar el usuario con ID: ${id}`);
                throw new InternalServerErrorException('Error interno del servidor');
            };

            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            };
            
            this.logger.error(`Error inesperado al eliminar el usuario con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };
}
