import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { ILogger } from "libs/domain/src";
import { UserDocument, Users} from "libs/domain/src";
import { Model } from "mongoose";
import { 
    IUser, 
    IUserRepository, 
    UserInput, 
    IUserFull, 
    PatchUserInput, 
    IPatchUser, 
    PatchPasswordInput, 
    IUserWithRole
} from "src/user/domain";
import { PasswordUtil, validateUserInput } from "src/user/utils";
import { v4 as uuidv4 } from 'uuid';
import { ERole } from 'libs/domain/src/enum'
import { errorMessagesCode, errorMessagesUser, errorMessagesGlobal } from "libs/infraestructure/src/constants";


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
                this.logger.warn(errorMessagesUser.createDuplicateEmail(validateUser.email));
                throw new Error(errorMessagesCode.DUPLICATE_EMAIL);
            };

            const existingRut = await this.userModel.findOne({ rut: validateUser.rut });
            if (existingRut) {
                this.logger.warn(errorMessagesUser.createDuplicateRut(validateUser.rut));
                throw new Error(errorMessagesCode.DUPLICATE_RUT);
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
            this.logger.log(errorMessagesUser.createSuccess(user.email));
            return newUser as IUser;
        } catch (error) {
            if (error.message === errorMessagesCode.DUPLICATE_EMAIL) throw error;

            if (error.message === errorMessagesCode.DUPLICATE_RUT) throw error;

            this.logger.error(errorMessagesUser.createError(user?.email ?? errorMessagesGlobal.unknown), error?.stack);
            throw new Error(errorMessagesCode.DATABASE_ERROR);        
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

            this.logger.log(errorMessagesUser.findAllSuccess(users.length));
            return users as IUserFull[];
        } catch(error) {
            this.logger.error(errorMessagesUser.findAllError(error.message || error));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
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
                this.logger.warn(errorMessagesUser.findByIdNotFound(id));
                return null;
            };

            this.logger.log(errorMessagesUser.findByIdSuccess(id));
            return user as IUserFull;
        }catch(error){
            this.logger.error(errorMessagesUser.findByIdError(id, error.message || error));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };

    async findByEmail(email: string): Promise<IUserWithRole | null> {
        try {
            if (!email) {
                this.logger.warn(errorMessagesUser.findByEmailEmpty());
                return null;
            };
    
            const user = await this.userModel.findOne({ email });
            if (!user) {
                this.logger.warn(errorMessagesUser.findByEmailNotFound(email));
                return null;
            };
    
            this.logger.log(errorMessagesUser.findByEmailSuccess(email));
            return user as IUserWithRole;
        } catch (error) {
            this.logger.error(errorMessagesUser.findByEmailError(email, error.message || error));
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    }

    async update(user: PatchUserInput, id: string): Promise<IPatchUser | null> {
        try {
            const existingUser = await this.userModel.findOne({ id });
            if (!existingUser) {
                this.logger.warn(errorMessagesUser.updateNotFound(id));
                return null;
            };

            if (user.email && user.email !== existingUser.email) {
                const existingEmail = await this.userModel.findOne({ email: user.email });
                if (existingEmail) {
                    this.logger.warn(errorMessagesUser.updateDuplicateEmail(user.email));
                    throw new Error(errorMessagesCode.DUPLICATE_EMAIL);
                };
            };

            const updatedUser = await this.userModel.findOneAndUpdate(
                { id },
                { $set: user },
                { new: true }
            ).exec();

            this.logger.log(errorMessagesUser.updateSuccess(id));
            return updatedUser as IPatchUser;
        } catch (error) {
            if (error.message === errorMessagesCode.DUPLICATE_EMAIL) throw error;

            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };

    async updatePassword(id: string, resetPassword: PatchPasswordInput): Promise<boolean> {
        try {
            const existingUser = await this.userModel.findOne({ id });
            if (!existingUser) {
            this.logger.warn(errorMessagesUser.updatePasswordNotFound(id));
            return false;
            }

            const hashedPassword = await PasswordUtil.hash(resetPassword.newPassword);

            const result = await this.userModel.updateOne(
            { id },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
            );

            if (result.modifiedCount === 0) {
                this.logger.warn(errorMessagesUser.updatePasswordNotModified(id));
                return false;
            }

            this.logger.log(errorMessagesUser.updatePasswordSuccess(id));
            return true;
        } catch (error) {
            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        }
    }

    async delete(id: string): Promise<boolean> {
        try{
            const existingUser = await this.userModel.findOne({ id });
            if (!existingUser) {
                this.logger.warn(errorMessagesUser.deleteNotFound(id));
                return false;
            };
            
            await this.userModel.deleteOne({ id }).exec();
            this.logger.log(errorMessagesUser.deleteSuccess(id));
            return true;
        }catch(error){
            this.logger.error(errorMessagesGlobal.unexpectedError);
            throw new Error(errorMessagesCode.DATABASE_ERROR);
        };
    };
}