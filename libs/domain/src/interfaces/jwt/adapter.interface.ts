export interface IJwtAdapterService {
    createToken(payload: any, expiresIn: string | number): Promise<any>;
    verifyToken(token: string): Promise<any>;
    decodeToken(token: string): Promise<any>;
}


