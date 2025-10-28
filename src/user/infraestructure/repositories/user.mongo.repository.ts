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

    //Crear usuario 
    async create(user: UserInput, roleCode: string): Promise<IUser> {
        try {
            //Validar usuario con Zod 
            const validateUser = validateUserInput(user);
            const id = uuidv4();
            
            // Validar que el email no exista
            const existingEmail = await this.userModel.findOne({ email: validateUser.email });
            if (existingEmail) {
                this.logger.warn(`Intento de crear email ${validateUser.email} duplicado`);
                throw new BadRequestException(`El email ${validateUser.email} ya existe en el sistema`);
            }

            // Validar que el RUT no exista
            const existingRut = await this.userModel.findOne({ rut: validateUser.rut });
            if (existingRut) {
                this.logger.warn(`Intento de crear RUT ${validateUser.rut} duplicado`);
                throw new BadRequestException(`El RUT ${validateUser.rut} ya existe en el sistema`);
            }
    
            // Hashear la contraseña
            const hashedPassword = await PasswordUtil.hash(user.password);
    
            // Rol por defecto si no se envía (registro web)
            const assignedRole = roleCode ?? ERole.CLIENT; 

            // Crear nuevo usuario con rol por defecto
            const newUser = new this.userModel({
                ...user,
                id,
                password: hashedPassword,
                roleCode: assignedRole,
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
    
            // Guardar el usuario
            await newUser.save();
            this.logger.log(`Usuario creado exitosamente con email ${user.email} y ID ${id}`);
            return newUser as IUser;
    
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Error al crear usuario: ${error.message || error}`);
            // Lanza el error para que el controlador o servicio superior lo maneje
            throw error instanceof BadRequestException ? error : new InternalServerErrorException('Error interno al crear el usuario');
        }
    }

    //Acceder a todos los usuarios 
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
            throw new InternalServerErrorException('Error interno al obtener los usuarios');
        }
    }

    //Acceder a los usuarios por ID
    async findById(id: string): Promise<IUserFull> {
        try{
            //Validar que el usuario exista
            const userId = await this.userModel.findOne({ id })
            if(!userId){
                this.logger.warn(`User con el ID ${id} no encontrado`);
                throw new NotFoundException(`Usuario con el ID ${id} no encontrado`);
            } 

            const users = await this.userModel.aggregate([
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

            if (users.length === 0) {
                this.logger.warn(`User con el ID ${id} no encontrado después de la agregación`);
                throw new NotFoundException(`Usuario con el ID ${id} no encontrado`);
            }

            this.logger.log(`Usuario con ID ${id} encontrado exitosamente`);
            return users[0] as IUserFull;

        }catch(error){
            // Si ya es una excepción conocida, la re-lanzamos
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Error al obtener usuario por ID ${id}: ${error.message || error}`);
            throw new InternalServerErrorException('Error interno al obtener el usuario');
        }
    }

    //funcion para obtener un usuario por su email
    async findByEmail(email: string): Promise<IUserWithRole | null> {
        try {
            if (!email) {
                this.logger.warn('Intento de buscar usuario con email vacío');
                throw new BadRequestException('El email es requerido');
            }
    
            const user = await this.userModel.findOne({ email });             
            if (!user) {
                this.logger.warn(`Usuario con email ${email} no encontrado`);
                return null;
            }
    
            this.logger.log(`Usuario con email ${email} encontrado exitosamente`);
            return user as IUserWithRole;
        } catch (error) {
            // Si ya es una excepción conocida, la re-lanzamos
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Error al obtener usuario por email ${email}: ${error.message || error}`);
            throw new InternalServerErrorException('Error interno al obtener el usuario por email');
        }
    }

    //Actualizar información del usuario 
    async update(user: PatchUserInput, id: string): Promise<IPatchUser | void> {
        try {
            // Verificar si el usuario existe
            const existingUser = await this.userModel.findOne({ id });
            if (!existingUser) {
                this.logger.warn(`Usuario con Id: ${id} no encontrado`);
                throw new BadRequestException(`Usuario con Id: ${id} no encontrado`);
            }
    
            // Preparar los datos para actualizar
            const updatedData = {
                ...user,
                updatedAt: new Date(),
            };
    
            // Importante: usar findOneAndUpdate con { id } porque el campo `id` no es el _id de Mongo
            const updatedUser = await this.userModel.findOneAndUpdate(
                { id },
                { $set: updatedData },
                { new: true } // Retorna el usuario actualizado
            );
    
            return updatedUser as IPatchUser;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
    
            this.logger.error(`Error al actualizar el usuario con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno al actualizar el usuario');
        }
    }

    //Actulizar las contraseña del usuario 
    async updatePassword(id: string, resetPassword: PatchPasswordInput): Promise<boolean> {
        try {
          const user = await this.userModel.findOne({ id });
          if (!user) {
            this.logger.warn(`Usuario con Id: ${id} no encontrado`);
            throw new NotFoundException(`Usuario con Id: ${id} no encontrado`);
          }

          // Validar que la contraseña actual sea correcta
          const isCurrentPasswordValid = await PasswordUtil.validate(resetPassword.oldPassword, user.password);
          if (!isCurrentPasswordValid) {
            this.logger.warn(`Contraseña actual incorrecta para el usuario con Id: ${id}`);
            throw new BadRequestException('La contraseña actual es incorrecta');
          }

          // Validar que la nueva contraseña no sea igual a la actual
          if (resetPassword.oldPassword === resetPassword.newPassword) {
            this.logger.warn(`La nueva contraseña no puede ser igual a la actual para el usuario con Id: ${id}`);
            throw new BadRequestException('La nueva contraseña no puede ser igual a la actual');
          }
      
          const hashedPassword = await PasswordUtil.hash(resetPassword.newPassword);
      
          const updatedUser = await this.userModel.findOneAndUpdate(
            { id },
            {
              $set: {
                password: hashedPassword,
                updatedAt: new Date(),
              },
            },
            { new: true }
          );
      
          if (updatedUser?.password === hashedPassword) {
            this.logger.log(`Contraseña actualizada exitosamente para el usuario con Id: ${id}`);
            return true;
          } else {
            this.logger.error(`Error: La contraseña de ${id} no se actualizó correctamente`);
            throw new BadRequestException('La contraseña no se pudo actualizar');
          }
        } catch (error) {
          this.logger.error(
            `Error al actualizar contraseña de usuario con Id: ${id}`,
            error.stack,
          );
          if (error instanceof NotFoundException || error instanceof BadRequestException) {
            throw error;
          }
          throw new InternalServerErrorException('Error interno al actualizar la contraseña');
        }
    }

    //Eliminar usuario 
    async delete(id: string): Promise<void> {
        try{
            const existingUser = await this.userModel.findOne({ id });
            if (!existingUser) {
                this.logger.warn(`Usuario con Id: ${id} no encontrado`);
                throw new NotFoundException(`Usuario con Id: ${id} no encontrado`);
            }
            await this.userModel.deleteOne({ id }).exec();
            this.logger.log(`Usuario eliminado exitosamente con ID: ${id}`);
        }catch(error){
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            this.logger.error(`Error al eliminar el usuario con ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Error interno al eliminar el usuario');
        }
    }
}