
import { PatchPasswordInput, PatchUserInput, UserInput } from "../schemas";
import { ILogin, IUser, IUserFull, IPatchUser, IUserWithRole  } from "./index";
export interface IUserRepository {
    create(user: UserInput, roleCode: string): Promise<IUser | void>;
    findAll(): Promise<IUserFull[]>;
    findById(id: string): Promise<IUserFull>;
    findByEmail(email: string): Promise<IUserWithRole | null>;
    update(user: PatchUserInput, id: string): Promise<IPatchUser | void>;
    updatePassword(id: string, resetPassword: PatchPasswordInput): Promise<boolean>;
    delete(id: string): Promise<void>;
    // //Guardar usuario 
    // save(user: IUser): Promise<IUser>;
    // //Validar el usuario 
    // validateUserWithAut(email: string, password: string): Promise<ILogin | null>;
}