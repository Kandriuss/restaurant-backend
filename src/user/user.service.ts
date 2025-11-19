import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IUser, UserInput } from './domain';
import type { ILogger } from 'libs/domain/src';
import type { AdminCreateUserZ, CreateUserZ, IPatchUser, IUserRepository, PatchPasswordInput, PatchUserInput } from './domain'
import { z } from 'zod'
import { ERole } from 'libs/domain/src/enum';
import type { IRoleRespository } from 'src/role/domain';
import { IUserFull } from './domain';
import { errorMessagesCode, errorMessagesGlobal, errorMessagesUser } from 'libs/infraestructure/src/constants';
@Injectable()
export class UserService {
    constructor(
        @Inject('UserRepository') private readonly userRepository: IUserRepository,
        @Inject('LoggerService') private readonly logger: ILogger,
        @Inject('RoleRepository') private readonly roleRepository: IRoleRespository,
    ){}
    async createByClient(user: z.infer<typeof CreateUserZ>): Promise<IUser> {
        try {
            const createdUser = await this.userRepository.create(user, ERole.CLIENT);

            this.logger.log(errorMessagesUser.createUserSuccess);
            return createdUser as IUser;
        } catch (error) {
            if (error.message === errorMessagesCode.DUPLICATE_RUT) {
                this.logger.warn(errorMessagesUser.createUserDuplicate);
                throw new ConflictException(errorMessagesUser.createUserDuplicateRut);
            };

            if (error.message === errorMessagesCode.DUPLICATE_EMAIL) {
                this.logger.warn(errorMessagesUser.createUserDuplicate);
                throw new ConflictException(errorMessagesUser.createUserDuplicateEmail);
            };

            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };

            this.logger.error(errorMessagesUser.createError(error.message), error.stack);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };

    async createByAdmin(user: z.infer<typeof AdminCreateUserZ>): Promise<IUser> {
        try {
            const createdUser = await this.userRepository.create(user, ERole.ADMIN);
            this.logger.log(errorMessagesUser.createAdminSuccess);

            return createdUser as IUser;
        } catch (error) {
            if (error.message === errorMessagesCode.DUPLICATE_RUT) {
                this.logger.warn(errorMessagesUser.createUserDuplicate);
                throw new ConflictException(errorMessagesUser.createUserDuplicateRut);
            };

            if (error.message === errorMessagesCode.DUPLICATE_EMAIL) {
                this.logger.warn(errorMessagesUser.createUserDuplicate);
                throw new ConflictException(errorMessagesUser.createUserDuplicateEmail);
            };

            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };

            this.logger.error(errorMessagesUser.createError(error.message), error.stack);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };

    async findAll(): Promise<IUserFull[]>{
        try {
            const users = await this.userRepository.findAll();
            this.logger.log(`Usuarios obtenidos exitosamente`);
            return users as IUserFull[];
        }catch(error){
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };

            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };

    async findById(id: string): Promise<IUserFull | null>{
        try{
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) throw new NotFoundException(errorMessagesUser.findByIdNotFound(id));

            this.logger.log(errorMessagesUser.findByIdSuccess(id));
            return existingUser as IUserFull;
        }catch(error){
            if (error instanceof NotFoundException) throw error;
            if (error.message === errorMessagesCode.DATABASE_ERROR) throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    }

    async getByEmail(email: string): Promise<IUser>{
        try{
            const user = await this.userRepository.findByEmail(email);

            this.logger.log(errorMessagesUser.findByEmailSuccess(email));
            return user as IUser;
        }catch(error){
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };

            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            };

            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        }
    }

    async update(user: PatchUserInput, id: string): Promise<IPatchUser | null> {
        try {  
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) throw new NotFoundException(errorMessagesUser.findByIdNotFound(id));

            const updatedUser = await this.userRepository.update(user, id);
            this.logger.log(errorMessagesUser.updateSuccess(id));
            return updatedUser as IPatchUser;
        } catch (error) {
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };

            if (error.message === errorMessagesCode.DUPLICATE_EMAIL) {
                this.logger.warn(errorMessagesUser.updateDuplicateEmail(user.email as string));
                throw new ConflictException(errorMessagesUser.createUserDuplicateEmail);
            };

            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };
    
    async updatePassword(id: string, resetPassword: PatchPasswordInput): Promise<boolean> {
        try {
            const updated = await this.userRepository.updatePassword(id, resetPassword);
        
            if (!updated) {
                this.logger.warn(errorMessagesUser.updatePasswordNotModified(id));
                throw new NotFoundException(errorMessagesUser.updatePasswordNotFound(id));
            }
        
            this.logger.log(errorMessagesUser.updatePasswordSuccess(id));
            return true;
        } catch (error) {
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            }
        
            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };
    
    async delete(id: string): Promise<{ message: string }> {
        try {
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) throw new NotFoundException(errorMessagesUser.findByIdNotFound(id));

            const deleted = await this.userRepository.delete(id);
            if (!deleted) {
                this.logger.warn(errorMessagesUser.deleteError(id));
                throw new InternalServerErrorException(errorMessagesUser.deleteUserError);
            }

            this.logger.log(errorMessagesUser.deleteSuccess(id));
            return { message: errorMessagesUser.deleteUserSuccess };
        } catch (error) {
            if (error.message === errorMessagesCode.DATABASE_ERROR) {
                this.logger.error(errorMessagesGlobal.databaseError);
                throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
            };

            if (error instanceof NotFoundException) throw error;
            
            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new InternalServerErrorException(errorMessagesGlobal.internalServerError);
        };
    };
}
