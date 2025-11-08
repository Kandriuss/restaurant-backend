import { RoleInput, PatchRoleInput, IRole } from '../../../../libs/domain/src';

export interface IRoleRespository {
    create(role: RoleInput): Promise<IRole | void>
    findAll(): Promise<IRole[]>
    findById(id: string): Promise<IRole | void>
    findByCode(code: string): Promise<IRole | void>
    update(id: string, role: PatchRoleInput): Promise<IRole | undefined>
    delete(id:string): Promise<void>
}