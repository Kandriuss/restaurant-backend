import {UserInput} from 'libs/domain/src'

export type IUser = UserInput;
export interface IUserWithRole extends IUser {
    roleCode: string;
}