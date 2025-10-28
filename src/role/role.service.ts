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

    //Metodo para crear rol
    async create(role: RoleInput): Promise<IRole | void> {
        return await this.roleRepository.create(role);
    }

    //Metodo para acceder a todo los roles 
    async getAll(): Promise<IRole[]> {
        return await this.roleRepository.findAll();
    }

    //Metodo para acceder a el Rol segun el ID
    async getById(id: string): Promise<IRole> {
        try {
            const role = await this.roleRepository.findById(id);
    
            return role as IRole;
        } catch (error) {
            this.logger.error(`Error al obtener el rol con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno al obtener el rol');
        }
    }

    //Acceder a role por el code
    async getByCode(code: string): Promise<IRole | void> {
        try{
            const role = await this.roleRepository.findByCode(code)
            return role as IRole;
        }catch(error){
            this.logger.error(`Error al obtener el rol con code: ${code}`, error.stack);
            throw new InternalServerErrorException('Error interno al obtener el rol');
        }
    }

    //Metodo para actualizar rol
    async update(id: string, role: PatchRoleInput): Promise<IRole | void> {
        try{
            //Variable
            const existingRole = await this.roleRepository.findById(id);
            //Verificacion si el id existe
            if (!existingRole){
                throw new NotFoundException(`Rol con el ID ${id} no encontrado`);
            }
            return await this.roleRepository.update(id, role);
        }catch (error) {
            // Si ya es una excepción conocida (como NotFoundException), la re-lanzamos
            if (error instanceof NotFoundException) {
                this.logger.warn(`Intento de actualizar rol inexistente con ID: ${id}`);
                throw error;
            }
            
            // Para otros errores, registramos el error y lanzamos una excepción genérica
            this.logger.error(`Error al actualizar el rol con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno al actualizar el rol');
        }
    }

    //Metodo para eliminar rol
    async delete(id: string): Promise<void> { 
        try {
            // Verificar si el rol existe antes de eliminarlo
            const existingRole = await this.roleRepository.findById(id);
            if (!existingRole) {
                throw new NotFoundException(`Rol con el ID ${id} no encontrado`);
            }
            
            await this.roleRepository.delete(id);
            this.logger.log(`Rol con ID ${id} eliminado exitosamente`);
        } catch (error) {
            // Si ya es una excepción conocida (como NotFoundException), la re-lanzamos
            if (error instanceof NotFoundException) {
                this.logger.warn(`Intento de eliminar rol inexistente con ID: ${id}`);
                throw error;
            }
            
            // Para otros errores, registramos el error y lanzamos una excepción genérica
            this.logger.error(`Error al eliminar el rol con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno al eliminar el rol');
        }
    }
}
