import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { ILogger } from "libs/domain/src";
import { UserDocument, Users} from "libs/domain/src";
import { Model } from "mongoose";
import { IUser, IUserRepository, UserInput, IUserFull, PatchUserInput, IPatchUser, PatchPasswordInput, IUserWithRole } from "src/user/domain";
import { PasswordUtil, validateUserInput } from "src/user/utils";
import { v4 as uuidv4 } from 'uuid';
import { ERole } from 'libs/domain/src/enum'

const COLLECTION_NAME = 'users';
@Injectable()
export class UserMongoRepository implements IUserRepository{
    constructor(
        @InjectModel(Users.name) private readonly userModel: Model<UserDocument>,
        @Inject('LoggerService') private readonly logger: ILogger,
    ){}

    async create(user: UserInput, roleCode: string): Promise<IUser> {
        try {
            const validateUser = validateUserInput(user);
            const id = uuidv4();
            
            const existingEmail = await this.userModel.findOne({ email: validateUser.email });

            if (existingEmail) {
                this.logger.warn(`Intento de crear email ${validateUser.email} duplicado`);
                throw new Error('DUPLICATE_ENTRY_EMAIL');
            };

            const existingRut = await this.userModel.findOne({ rut: validateUser.rut });
            if (existingRut) {
                this.logger.warn(`Intento de crear RUT ${validateUser.rut} duplicado`);
                throw new Error('DUPLICATE_ENTRY_RUT');
            };

            const hashedPassword = await PasswordUtil.hash(user.password);

            const assignedRole = roleCode ?? ERole.CLIENT; 

            const newUser = new this.userModel({
                ...user,
                id,
                password: hashedPassword,
                roleCode: assignedRole,
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await newUser.save();

            this.logger.log(`Usuario creado exitosamente con email ${user.email} y ID ${id}`);

            return newUser as IUser;

        } catch (error) {
            if (error.message === 'DUPLICATE_ENTRY_EMAIL') throw error;

            if (error.message === 'DUPLICATE_ENTRY_RUT') throw error;

            this.logger.error(`Error técnico al crear el usuario: ${user?.email ?? 'desconocido'}`, error?.stack);
            throw new Error('DATABASE_ERROR');        
        };
    };

    async findAll(): Promise<IUserFull[]> {
        try{
            const users = await this.userModel.aggregate([
                {
                    $lookup:{
                        from: 'roles',
                        let: {roleCode: '$roleCode'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq:['$code', '$$roleCode']
                                    }
                                }
                            },
                            {
                                $project:{
                                    _id: 0,
                                    id: 1,
                                    description: 1,
                                    code: 1,
                                    active: 1
                                }
                            }
                        ],
                        as: 'role'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        fullName: { $concat: ['$name', ' ', '$lastName'] },
                        email: 1,
                        phone: 1,
                        active: 1,
                        rut: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        role: { $arrayElemAt: ['$role', 0] },
                    }
                }
            ]);

            this.logger.log(`Se encontraron ${users.length} usuarios`);
            return users as IUserFull[];

        } catch(error) {
            this.logger.error(`Error al obtener usuarios: ${error.message || error}`);
            throw new Error('DATABASE_ERROR');
        };
    };

    async findById(id: string): Promise<IUserFull | null> {
        try{
            const [user] = await this.userModel.aggregate([
                {
                    $match: { id: id }
                },
                {
                    $lookup:{
                        from: 'roles',
                        let: {roleCode: '$roleCode'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq:['$code', '$$roleCode']
                                    }
                                }
                            },
                            {
                                $project:{
                                    _id: 0,
                                    id: 1,
                                    description: 1,
                                    code: 1,
                                    active: 1
                                }
                            }
                        ],
                        as: 'role'
                    }
                },   
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        fullName: { $concat: ['$name', ' ', '$lastName'] },
                        email: 1,
                        phone: 1,
                        active: 1,
                        rut: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        role: { $arrayElemAt: ['$role', 0] },
                    }
                }
            ]);

            if(!user) {
                this.logger.warn(`User con el ID ${id} no encontrado`);
                return null;
            };

            this.logger.log(`Usuario encontrado con ID: ${id}`);
            return user as IUserFull;
        }catch(error){
            this.logger.error(`Error al obtener usuario por ID ${id}: ${error.message || error}`);
            throw new Error('DATABASE_ERROR');
        };
    };

    async findByEmail(email: string): Promise<IUserWithRole | null> {
        try {
            if (!email) {
                this.logger.warn('Intento de buscar usuario con email vacío');
                return null;
            };
    
            const user = await this.userModel.findOne({ email });      
               
            if (!user) {
                this.logger.warn(`Usuario con email ${email} no encontrado`);
                return null;
            };
    
            this.logger.log(`Usuario con email ${email} encontrado exitosamente`);
            return user as IUserWithRole;

        } catch (error) {
            this.logger.error(`Error al obtener usuario por email ${email}: ${error.message || error}`);
            throw new Error('DATABASE_ERROR');
        }
    }

    async update(user: PatchUserInput, id: string): Promise<IPatchUser | null> {
        try {
            const existingUser = await this.userModel.findOne({ id });

            if (!existingUser) {
                this.logger.warn(`Usuario con Id: ${id} no encontrado`);
                return null;
            };
    
            const updatedUser = await this.userModel.findOneAndUpdate(
                { id },
                { $set: user },
                { new: true }
            ).exec();

            this.logger.log(`Usuario actualizado exitosamente con ID: ${id}`);
    
            return updatedUser as IPatchUser;
        } catch (error) {
            this.logger.error(`Error al actualizar el usuario con ID: ${id}`, error.stack);
            throw new Error('DATABASE_ERROR');
        };
    };

    //Actulizar las contraseña del usuario 
    async updatePassword(id: string, resetPassword: PatchPasswordInput): Promise<boolean> {
        try {
            const existingUser = await this.userModel.findOne({ id });
            if (!existingUser) {
                this.logger.warn(`Usuario con ID: ${id} no encontrado`);
                return false;
            }
    
            const hashedPassword = await PasswordUtil.hash(resetPassword.newPassword);
    
            const updatedUser = await this.userModel.findOneAndUpdate(
                { id },
                { $set: { password: hashedPassword, updatedAt: new Date() } },
                { new: true }
            );
    
            if (updatedUser) {
                this.logger.log(`Contraseña actualizada exitosamente para el usuario con ID: ${id}`);
                return true;
            }
    
            this.logger.warn(`Error al actualizar la contraseña: usuario con ID ${id} no encontrado durante la actualización`);
            return false;
    
        } catch (error) {
            this.logger.error(`Error al actualizar la contraseña del usuario con ID: ${id}`, error.stack);
            throw new Error('DATABASE_ERROR');
        };
    };
    
    //Eliminar usuario 
    async delete(id: string): Promise<boolean> {
        try{
            const existingUser = await this.userModel.findOne({ id });
            if (!existingUser) {
                this.logger.warn(`Usuario con Id: ${id} no encontrado`);
                return false;
            }
            await this.userModel.deleteOne({ id }).exec();
            this.logger.log(`Usuario eliminado exitosamente con ID: ${id}`);
            return true;
        }catch(error){
            this.logger.error(`Error al eliminar el usuario con ID: ${id}`, error.stack);
            throw new Error('DATABASE_ERROR');
        };
    };
}