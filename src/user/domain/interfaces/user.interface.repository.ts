
import { PatchPasswordInput, PatchUserInput, UserInput } from "../schemas";
import { ILogin, IUser, IUserFull, IPatchUser, IUserWithRole  } from "./index";
export interface IUserRepository {
    //Crear usuario
    create(user: UserInput, roleCode: string): Promise<IUser | void>;
    //Encontrar todos los usaurios
    findAll(): Promise<IUserFull[]>;
    //Encontrar usuario por Id
    findById(id: string): Promise<IUserFull>;
    //Econtrar usuario por email
    findByEmail(email: string): Promise<IUserWithRole | null>;
    //Modificar usuario
    update(user: PatchUserInput, id: string): Promise<IPatchUser | void>;
    //Actulizar las contraseña del usuario 
    updatePassword(id: string, resetPassword: PatchPasswordInput): Promise<boolean>;
    // //delete
    delete(id: string): Promise<void>;
    // //Guardar usuario 
    // save(user: IUser): Promise<IUser>;
    // //Validar el usuario 
    // validateUserWithAut(email: string, password: string): Promise<ILogin | null>;
}