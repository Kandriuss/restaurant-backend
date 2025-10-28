import {UserInput} from '../schemas'

// Interfaz base del usuario (sin roleCode para mantener la lógica de negocio)
export type IUser = UserInput;

// Interfaz extendida que incluye roleCode cuando es necesario (para autenticación, etc.)
export interface IUserWithRole extends IUser {
    roleCode: string;
}