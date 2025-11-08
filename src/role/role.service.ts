import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import type { IRoleRespository } from './domain';
import {RoleInput, PatchRoleInput, IRole} from '../../libs/domain/src';
import type {ILogger} from '../../libs/domain/src';
import { IUser } from 'src/user/domain';


@Injectable()
export class RoleService {
    constructor(
        @Inject('RoleRepository')
        private readonly roleRepository: IRoleRespository,
        @Inject('LoggerService')
        private readonly logger: ILogger
    ){}

    async create(role: RoleInput): Promise<IRole | void> {
        try {
            this.logger.log('Creando rol');
            return await this.roleRepository.create(role);
        } catch (error) {
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al crear el rol`);
                throw new InternalServerErrorException('Error interno del servidor');
            };
            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            };
            this.logger.error(`Error inesperado al crear el rol`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };

    async getAll(): Promise<IRole[]> {
        try {
            this.logger.log('Obteniendo todos los roles');
            return await this.roleRepository.findAll();
        } catch (error) {
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al obtener todos los roles`);
                throw new InternalServerErrorException('Error interno del servidor');
            };
            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            };
            this.logger.error(`Error inesperado al obtener todos los roles`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };

    async getById(id: string): Promise<IRole> {
        try {
            const role = await this.roleRepository.findById(id);

            if (!role) {
                throw new NotFoundException(`Rol con el ID ${id} no encontrado`);
            };
            this.logger.log(`Rol encontrado con ID: ${id}`);

            return role as IRole;

        } catch (error) {
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al obtener el rol con ID: ${id}`);
                throw new InternalServerErrorException('Error interno del servidor');
            };
            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            };
            this.logger.error(`Error inesperado al obtener el rol con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        }
    };

    async getByCode(code: string): Promise<IRole | void> {
        try{
            const role = await this.roleRepository.findByCode(code)
            return role as IRole;
        }catch(error){
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al obtener el rol con code: ${code}`);
                throw new InternalServerErrorException('Error interno del servidor');
            };
            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            };
            this.logger.error(`Error inesperado al obtener el rol con code: ${code}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };
    async update(id: string, role: PatchRoleInput): Promise<IRole | void> {
        try{
            const existingRole = await this.roleRepository.findById(id);

            if (!existingRole){
                throw new NotFoundException(`Rol con el ID ${id} no encontrado`);
            };

            return await this.roleRepository.update(id, role);

        }catch (error) {
           if (error.message === 'DATABASE_ERROR') {
            this.logger.error(`Error de base de datos al actualizar el rol con ID: ${id}`);
            throw new InternalServerErrorException('Error interno del servidor');
           };

           if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
            throw error;
           };
           
           this.logger.error(`Error inesperado al actualizar el rol con ID: ${id}`, error.stack);
           throw new InternalServerErrorException('Error interno del servidor');
        };
    };

    async delete(id: string): Promise<{ message: string }> { 
        try {
            // Verificar si el rol existe antes de eliminarlo
            const existingRole = await this.roleRepository.findById(id);
            
            if (!existingRole) {
                throw new NotFoundException(`Rol con el ID ${id} no encontrado`);
            };
            
            await this.roleRepository.delete(id);
            this.logger.log(`Rol con ID ${id} eliminado exitosamente`);
            return { message: 'Rol eliminado exitosamente' };
        } catch (error) {
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al eliminar el rol con ID: ${id}`);
                throw new InternalServerErrorException('Error interno del servidor');
            };

            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            };

            this.logger.error(`Error inesperado al eliminar el rol con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };
}
