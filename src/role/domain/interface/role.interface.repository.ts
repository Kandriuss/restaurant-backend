import { RoleInput, PatchRoleInput, IRole } from '../../../../libs/domain/src';

export interface IRoleRespository {
    //Crear rol
    create(role: RoleInput): Promise<IRole | void>
    //Econtrar todos los roles 
    findAll(): Promise<IRole[]>
    //Encontrar role por ID
    findById(id: string): Promise<IRole | void>
    //Encontrar role por code 
    findByCode(code: string): Promise<IRole | void>
    //Actualziar rol
    update(id: string, role: PatchRoleInput): Promise<IRole>
    //Eliminar rol
    delete(id:string): Promise<void>
}