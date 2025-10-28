export interface IUserFull {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    active: boolean;
    roleCode: string;
    rut: string;
    createdAt: Date;
    updatedAt: Date;
    role: {
        id: string;
        description: string;
        code: string;
        active: boolean;
    }
}