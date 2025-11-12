import { RoleInput, PatchRoleInput, IRole } from 'libs/domain/src';
import { IRolePatch } from './role-patch.interface';

export interface IRoleRespository {
    create(role: RoleInput): Promise<IRole>
    findAll(): Promise<IRole[]>
    findById(id: string): Promise<IRole | null>
    findByCode(code: string): Promise<IRole | null>
    update(id: string, role: PatchRoleInput): Promise<IRolePatch | null>
    delete(id:string): Promise<boolean>
}