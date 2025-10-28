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

    //Crear usuario 
    async create(role: RoleInput): Promise<IRole | void> {
        try {
            const id = uuidv4();
            const existingRole = await this.roleModel.findOne({ code: role.code})
            if (existingRole){
                this.logger.warn(`Intento de crear rol con código duplicado: ${role.code}`);
                throw new BadRequestException(`El code ${role.code} ya existe`)
            }
            const newRole = new this.roleModel({
                ...role,
                id,
                active: true
            });
            
            await newRole.save();
            this.logger.log(`Rol creado exitosamente con ID: ${id} y código: ${role.code}`);
            return newRole as IRole;

        } catch (error) {
            const codeValue = role?.code ?? 'desconocido'; // evita fallo si role es undefined
            this.logger.error(`Error al crear el rol con código: ${codeValue}`, error?.stack);
            console.error('ERROR COMPLETO:', error); // para depuración
        
            if (error instanceof BadRequestException) {
                throw error;
            }
        
            throw new InternalServerErrorException('Error interno al crear el rol');
        }
        
    }

    //Encontrar todos los roles
    async findAll(): Promise<IRole[]> {
        try {
            const roles = await this.roleModel.find().exec();
            this.logger.log(`Se encontraron ${roles.length} roles`);
            return roles as IRole[];
        } catch (error) {
            this.logger.error('Error al obtener todos los roles', error.stack);
            throw new InternalServerErrorException('Error interno al obtener los roles');
        }
    }

    //Encontrar role por ID
    async findById(id: string): Promise<IRole | void> {
        try {
            const role = await this.roleModel.findOne({ id }).exec();
            if (!role) {
                this.logger.warn(`Rol con ID ${id} no encontrado`);
                return undefined;
            }
            this.logger.log(`Rol encontrado con ID: ${id}`);
            return role as IRole;
        } catch (error) {
            this.logger.error(`Error al buscar el rol con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno al buscar el rol');
        }
    }
    
    //Encontrar role por Code
    async findByCode(code: string): Promise<IRole | void> {
        try{
            const existingCode = await this.roleModel.findOne({ code }).exec();
            if(!existingCode){
                this.logger.warn(`Rol con Code ${code} no encontrado`);
                return undefined;
            } 
            this.logger.log(`Rol encontrado con code ${code}`);
            return existingCode as IRole;
        }catch(error){
            this.logger.error(`Error al buscar el rol con Code: ${code}`, error.stack);
            throw new InternalServerErrorException('Error interno al buscar el rol');
        }
    }

    //Actualizar rol
    async update(id: string, role: PatchRoleInput): Promise<IRole> {
        try {
            const existingRole = await this.roleModel.findOne({ id });
            if (!existingRole) {
                this.logger.warn(`Intento de actualizar rol inexistente con ID: ${id}`);
                throw new NotFoundException(`Rol con ID ${id} no encontrado`);
            }

            // Si se está actualizando el código, verificar que no exista otro rol con el mismo código
            if (role.code && role.code !== existingRole.code) {
                const duplicateCode = await this.roleModel.findOne({ code: role.code });
                if (duplicateCode) {
                    this.logger.warn(`Intento de actualizar rol con código duplicado: ${role.code}`);
                    throw new BadRequestException(`El código ${role.code} ya existe`);
                }
            }

            const updatedRole = await this.roleModel.findOneAndUpdate(
                { id },
                { ...role },
                { new: true }
            ).exec();

            this.logger.log(`Rol actualizado exitosamente con ID: ${id}`);
            return updatedRole as IRole;
        } catch (error) {
            // Si ya es una excepción conocida, la re-lanzamos
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            
            this.logger.error(`Error al actualizar el rol con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno al actualizar el rol');
        }
    }

    //Eliminar rol
    async delete(id: string): Promise<void> {
        try {
            const existingRole = await this.roleModel.findOne({ id });
            if (!existingRole) {
                this.logger.warn(`Intento de eliminar rol inexistente con ID: ${id}`);
                throw new NotFoundException(`Rol con ID ${id} no encontrado`);
            }

            await this.roleModel.deleteOne({ id }).exec();
            this.logger.log(`Rol eliminado exitosamente con ID: ${id}`);
        } catch (error) {
            // Si ya es una excepción conocida, la re-lanzamos
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            this.logger.error(`Error al eliminar el rol con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno al eliminar el rol');
        }
    }
}