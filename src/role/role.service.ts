import { Inject, Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import type { IRoleRespository } from './domain';
import {RoleInput, PatchRoleInput, IRole} from '../../libs/domain/src';
import type {ILogger} from '../../libs/domain/src';
import { errorMessagesCode, errorMessagesGlobal, errorMessagesRole } from "libs/infraestructure/src/constants";

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

            if (existingRole) throw new BadRequestException(errorMessagesRole.CodeDuplicate(role.code));
        
            const newRole = await this.roleRepository.create(role);

            this.logger.log(errorMessagesRole.createRoleSuccess);
            return newRole;
        } catch (error) {
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError, error.stack);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            }
            if (error instanceof BadRequestException) throw error;
        
            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };
    
    async findAll(): Promise<IRole[]> {
        try {
            const roles = await this.roleRepository.findAll();

            this.logger.log(errorMessagesRole.findAllRoleSuccess);
            return roles as IRole[];
        } catch (error) {
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };
            
            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };
    
    async findById(id: string): Promise<IRole> {
        try {
          const role = await this.roleRepository.findById(id);
          if (!role) throw new NotFoundException(errorMessagesRole.findByIdNotFound(id));
    
          this.logger.log(errorMessagesRole.findByIdSuccess(id));
          return role as IRole;
        } catch (error) {
          if (error.message === errorMessagesCode.DATABASE_ERROR) {
            this.logger.error(errorMessagesGlobal.databaseError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
          };

          if (error instanceof NotFoundException) throw error;
    
          this.logger.error(errorMessagesGlobal.unexpectedError);
          throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        }
    };
    
    async findByCode(code: string): Promise<IRole> {
        try {
            const role = await this.roleRepository.findByCode(code);
            if (!role) throw new NotFoundException(errorMessagesRole.findByCodeNotFound(code));
        
            this.logger.log(errorMessagesRole.findByCodeSuccess(code));
            return role;
        } catch (error) {
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            }
            if (error instanceof NotFoundException) throw error;
        
            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };  
    
    async update(id: string, role: PatchRoleInput): Promise<IRole> {
        try {
            const updatedRole = await this.roleRepository.update(id, role);
            if (!updatedRole) throw new NotFoundException(errorMessagesRole.findByIdNotFound(id));
        
            this.logger.log(errorMessagesRole.updateSuccess(id));
            return updatedRole as IRole;
        } catch (error) {
            if (error.message === errorMessagesCode.ROLE_CODE_ALREADY_EXISTS) {
                this.logger.warn(errorMessagesRole.updateRoleDuplicated);
                throw new BadRequestException(errorMessagesRole.CodeDuplicate(role.code as string));
            };

            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };

            if (error instanceof NotFoundException) throw error;
        
            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };
    
    async delete(id: string): Promise<{ message: string }> {
        try {
            const deleted = await this.roleRepository.delete(id);
            if (!deleted) { throw new NotFoundException(errorMessagesRole.findByIdNotFound(id))};
        
            this.logger.log(errorMessagesRole.deleteSuccess(id));
            return { message: errorMessagesRole.deleteSuccess(id) };
        } catch (error) {
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            }
        
            if (error instanceof NotFoundException) throw error;
        
            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };
      
}
