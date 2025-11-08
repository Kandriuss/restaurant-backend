
import { PatchPasswordInput, PatchUserInput, UserInput } from 'libs/domain/src';
import { ILogin, IUser, IUserFull, IPatchUser, IUserWithRole  } from './index';
export interface IUserRepository {
    create(user: UserInput, roleCode: string): Promise<IUser>;
    findAll(): Promise<IUserFull[]>;
    findById(id: string): Promise<IUserFull | null>;
    findByEmail(email: string): Promise<IUserWithRole | null>;
    update(user: PatchUserInput, id: string): Promise<IPatchUser | null>;
    updatePassword(id: string, resetPassword: PatchPasswordInput): Promise<boolean>;
    delete(id: string): Promise<boolean>;
}