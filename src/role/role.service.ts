import { Inject, Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
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

    async create(role: RoleInput): Promise<IRole> {
        try {
            const existingRole = await this.roleRepository.findByCode(role.code);

            if (existingRole) throw new BadRequestException(`El código ${role.code} ya existe`);
        
            const newRole = await this.roleRepository.create(role);

            this.logger.log(`Rol ${role.code} creado exitosamente`);

            return newRole;
        } catch (error) {
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error('Error de base de datos al crear el rol');
                throw new InternalServerErrorException('Error interno del servidor');
            }
            if (error instanceof BadRequestException) throw error;
        
            this.logger.error('Error inesperado al crear el rol', error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };
    
    async findAll(): Promise<IRole[]> {
        try {
          this.logger.log('Obteniendo todos los roles');
          return await this.roleRepository.findAll();
        } catch (error) {
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error('Error de base de datos al obtener todos los roles');
                throw new InternalServerErrorException('Error interno del servidor');
            }
            this.logger.error('Error inesperado al obtener todos los roles', error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };
    
    async findById(id: string): Promise<IRole> {
        try {
          const role = await this.roleRepository.findById(id);
          if (!role) throw new NotFoundException(`Rol con el ID ${id} no encontrado`);
    
          this.logger.log(`Rol encontrado con ID: ${id}`);
          return role;
        } catch (error) {
          if (error.message === 'DATABASE_ERROR') {
            this.logger.error(`Error de base de datos al obtener el rol con ID: ${id}`);
            throw new InternalServerErrorException('Error interno del servidor');
          };

          if (error instanceof NotFoundException) throw error;
    
          this.logger.error(`Error inesperado al obtener el rol con ID: ${id}`, error.stack);
          throw new InternalServerErrorException('Error interno del servidor');
        }
    };
    
    async findByCode(code: string): Promise<IRole> {
        try {
            const role = await this.roleRepository.findByCode(code);
            if (!role) throw new NotFoundException(`Rol con el code ${code} no encontrado`);
        
            this.logger.log(`Rol encontrado con code: ${code}`);
            return role;
        } catch (error) {
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al obtener el rol con code: ${code}`);
                throw new InternalServerErrorException('Error interno del servidor');
            }
            if (error instanceof NotFoundException) throw error;
        
            this.logger.error(`Error inesperado al obtener el rol con code: ${code}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };  
    
    async update(id: string, role: PatchRoleInput): Promise<IRole> {
        try {
            const updatedRole = await this.roleRepository.update(id, role);
            if (!updatedRole) throw new NotFoundException(`Rol con el ID ${id} no encontrado`);
        
            this.logger.log(`Rol actualizado exitosamente con ID: ${id}`);
            return updatedRole as IRole;
        } catch (error) {
            if (error.message === 'ROLE_CODE_ALREADY_EXISTS') {
                this.logger.warn(`Intento de actualizar rol con código duplicado: ${role.code}`);
                throw new BadRequestException(`El código ${role.code} ya existe`);
            };

            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al actualizar el rol con ID: ${id}`);
                throw new InternalServerErrorException('Error interno del servidor');
            };

            if (error instanceof NotFoundException) throw error;
        
            this.logger.error(`Error inesperado al actualizar el rol con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };
    
    async delete(id: string): Promise<{ message: string }> {
        try {
            const deleted = await this.roleRepository.delete(id);
        
            if (!deleted) {
                throw new NotFoundException(`Rol con el ID ${id} no encontrado`);
            };
        
            this.logger.log(`Rol con ID ${id} eliminado exitosamente`);
            return { message: 'Rol eliminado exitosamente' };
      
        } catch (error) {
            if (error.message === 'DATABASE_ERROR') {
                this.logger.error(`Error de base de datos al eliminar el rol con ID: ${id}`);
                throw new InternalServerErrorException('Error interno del servidor');
            }
        
            if (error instanceof NotFoundException) throw error;
        
            this.logger.error(`Error inesperado al eliminar el rol con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno del servidor');
        };
    };
      
}
