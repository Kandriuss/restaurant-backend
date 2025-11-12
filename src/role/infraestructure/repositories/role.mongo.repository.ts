import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Inject } from "@nestjs/common";
import {InjectModel} from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RoleInput, PatchRoleInput } from "libs/domain/src";
import { IRole, Roles } from 'libs/domain/src';
import type { ILogger } from 'libs/domain/src'
import { IRoleRespository } from "src/role/domain";

const COLLECTION_NAME = 'roles';
@Injectable()
export class RoleMongoRepository implements IRoleRespository {
    
    constructor (
        @InjectModel(Roles.name) private readonly roleModel: Model <Roles>,
        @Inject('LoggerService') private readonly logger: ILogger,
    ){}

    async create(role: RoleInput): Promise<IRole> {
        try {
          const id = uuidv4();
          const existingRole = await this.roleModel.findOne({ code: role.code });
    
          if (existingRole) {
            this.logger.warn(`Intento de crear rol con código duplicado: ${role.code}`);
            throw new Error('ROLE_CODE_ALREADY_EXISTS');
          }
    
          const newRole = new this.roleModel({ ...role, id, active: true });
          await newRole.save();
    
          this.logger.log(`Rol creado exitosamente con ID: ${id} y código: ${role.code}`);
          return newRole as IRole;
        } catch (error) {
          if (error.message === 'ROLE_CODE_ALREADY_EXISTS') throw error;

          this.logger.error(`Error al crear el rol`, error.stack);
          throw new Error('DATABASE_ERROR');
        };
    };
    
    async findAll(): Promise<IRole[]> {
        try {
            const roles = await this.roleModel.find().exec();

            this.logger.log(`Se encontraron ${roles.length} roles`);
            return roles as IRole[];
        } catch (error) {
            this.logger.error('Error al obtener todos los roles', error.stack);
            throw new Error('DATABASE_ERROR');
        };
    };
    
    async findById(id: string): Promise<IRole | null> {
        try {
            const role = await this.roleModel.findOne({ id }).exec();

            if (!role) {
                this.logger.warn(`Rol con ID ${id} no encontrado`);
                return null;
            }

            this.logger.log(`Rol encontrado con ID: ${id}`);
            return role as IRole;
        } catch (error) {
            this.logger.error(`Error al buscar el rol con ID: ${id}`, error.stack);
            throw new Error('DATABASE_ERROR');
        };
    };
    
    async findByCode(code: string): Promise<IRole | null> {
        try {
            const existingCode = await this.roleModel.findOne({ code }).exec();
            if (!existingCode) {
                this.logger.warn(`Rol con Code ${code} no encontrado`);
                return null;
            };

            this.logger.log(`Rol encontrado con code ${code}`);
            return existingCode as IRole;
        } catch (error) {
          this.logger.error(`Error al buscar el rol con Code: ${code}`, error.stack);
          throw new Error('DATABASE_ERROR');
        };
    };
    
    async update(id: string, role: PatchRoleInput): Promise<IRole | null> {
        try {
            const existingRole = await this.roleModel.findOne({ id });
            if (!existingRole) {
                this.logger.warn(`Intento de actualizar rol inexistente con ID: ${id}`);
                return null;
            };
        
            if (role.code && role.code !== existingRole.code) {
                const duplicateCode = await this.roleModel.findOne({ code: role.code });
                if (duplicateCode) {
                this.logger.warn(`Intento de actualizar rol con código duplicado: ${role.code}`);
                throw new Error('ROLE_CODE_ALREADY_EXISTS');
                };
            };
        
            const updatedRole = await this.roleModel.findOneAndUpdate(
                { id },
                { ...role, updatedAt: new Date() },
                { new: true }
            ).exec();
        
            this.logger.log(`Rol actualizado exitosamente con ID: ${id}`);
            return updatedRole as IRole;
        } catch (error) {
            if (error.message === 'ROLE_CODE_ALREADY_EXISTS') throw error;

            this.logger.error(`Error al actualizar el rol con ID: ${id}`, error.stack);
            throw new Error('DATABASE_ERROR');
        };
    };
    
    async delete(id: string): Promise<boolean> {
        try {
            const existingRole = await this.roleModel.findOne({ id });
            if (!existingRole) {
                this.logger.warn(`Intento de eliminar rol inexistente con ID: ${id}`);
                return false;
            };
        
            await this.roleModel.deleteOne({ id }).exec();
            this.logger.log(`Rol eliminado exitosamente con ID: ${id}`);
            return true;
        } catch (error) {
            this.logger.error(`Error al eliminar el rol con ID: ${id}`, error.stack);
            throw new Error('DATABASE_ERROR');
        };
    };
};