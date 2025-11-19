import { Injectable, Inject } from "@nestjs/common";
import {InjectModel} from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RoleInput, PatchRoleInput } from "libs/domain/src";
import { IRole, Roles } from 'libs/domain/src';
import type { ILogger } from 'libs/domain/src'
import { IRoleRespository } from "src/role/domain";
import { errorMessagesCode, errorMessagesGlobal, errorMessagesRole } from "libs/infraestructure/src/constants";

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
            this.logger.warn(errorMessagesRole.CodeDuplicate(role.code));
            throw new Error(errorMessagesCode.ROLE_CODE_ALREADY_EXISTS);
          }
    
          const newRole = new this.roleModel({ ...role, id, active: true });
          await newRole.save();
    
          this.logger.log(errorMessagesRole.createSuccess(role.code, id));
          return newRole as IRole;
        } catch (error) {
          if (error.message === errorMessagesCode.ROLE_CODE_ALREADY_EXISTS) throw error;

            this.logger.error(errorMessagesRole.createError(error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };
    
    async findAll(): Promise<IRole[]> {
        try {
            const roles = await this.roleModel.find().exec();

            this.logger.log(errorMessagesRole.findAllSuccess(roles.length));
            return roles as IRole[];
        } catch (error) {
            this.logger.error(errorMessagesRole.findAllError(error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };
    
    async findById(id: string): Promise<IRole | null> {
        try {
            const role = await this.roleModel.findOne({ id }).exec();

            if (!role) {
                this.logger.warn(errorMessagesRole.findByIdNotFound(id));
                return null;
            }

            this.logger.log(errorMessagesRole.findByIdSuccess(id));
            return role as IRole;
        } catch (error) {
            this.logger.error(errorMessagesRole.findByIdError(id, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };
    
    async findByCode(code: string): Promise<IRole | null> {
        try {
            const existingCode = await this.roleModel.findOne({ code }).exec();
            if (!existingCode) {
                this.logger.warn(errorMessagesRole.findByCodeNotFound(code));
                return null;
            };

            this.logger.log(errorMessagesRole.findByCodeSuccess(code));
            return existingCode as IRole;
        } catch (error) {
          this.logger.error(errorMessagesRole.findByCodeError(code, error.message));
          throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };
    
    async update(id: string, role: PatchRoleInput): Promise<IRole | null> {
        try {
            const existingRole = await this.roleModel.findOne({ id });
            if (!existingRole) {
                this.logger.warn(errorMessagesRole.findByIdNotFound(id));
                return null;
            };
        
            if (role.code && role.code !== existingRole.code) {
                const duplicateCode = await this.roleModel.findOne({ code: role.code });
                if (duplicateCode) {
                this.logger.warn(errorMessagesRole.CodeDuplicate(role.code));
                throw new Error(errorMessagesCode.ROLE_CODE_ALREADY_EXISTS);
                };
            };
        
            const updatedRole = await this.roleModel.findOneAndUpdate(
                { id },
                { ...role, updatedAt: new Date() },
                { new: true }
            ).exec();
        
            this.logger.log(errorMessagesRole.updateSuccess(id));
            return updatedRole as IRole;
        } catch (error) {
            if (error.message === errorMessagesCode.ROLE_CODE_ALREADY_EXISTS) throw error;

            this.logger.error(errorMessagesRole.updateError(id, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };
    
    async delete(id: string): Promise<boolean> {
        try {
            const existingRole = await this.roleModel.findOne({ id });
            if (!existingRole) {
                this.logger.warn(errorMessagesRole.findByIdNotFound(id));
                return false;
            };
        
            await this.roleModel.deleteOne({ id }).exec();
            this.logger.log(errorMessagesRole.deleteSuccess(id));
            return true;
        } catch (error) {
            this.logger.error(errorMessagesRole.deleteError(id, error.message));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };
};