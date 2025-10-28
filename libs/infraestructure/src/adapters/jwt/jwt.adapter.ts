import * as Jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { IJwtPayload } from 'libs/domain/src';
import { UnauthorizedException } from '@nestjs/common';
import { IJwtAdapterService } from 'libs/domain/src';
import { ILogger } from 'libs/domain/src';

export class JwtAdapterService implements IJwtAdapterService {
  private readonly privateKey: string | undefined;
  private readonly publicKey: string;
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
    const rootPath = process.cwd(); // Directorio raíz del proyecto
    const configPath = path.join(rootPath, 'src', 'config');
    const publicKeyPath = path.join(configPath, 'public.key');
    const privateKeyPath = path.join(configPath, 'private.key');

    // Validación de las claves para el token que se generara en la creacion del token
    if (!fs.existsSync(publicKeyPath)) {
      this.logger.error(`Clave pública no encontrada en: ${publicKeyPath}`, 'JwtAdapterService');
      throw new Error(`Invalid public key path: ${publicKeyPath}`);
    }
    this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    this.logger.log('Clave pública cargada exitosamente', 'JwtAdapterService');

    if (fs.existsSync(privateKeyPath)) {
      this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      this.logger.log('Clave privada cargada exitosamente', 'JwtAdapterService');
    } else {
      this.logger.warn(`Clave privada no encontrada en: ${privateKeyPath}`, 'JwtAdapterService');
      console.warn(`Private key not found at: ${privateKeyPath}`);
    }
  }

  //Crear un token
  async createToken(payload: any, expiresIn: string | number): Promise<any> {
    try {
      if (!this.privateKey) {
        this.logger.error('Clave privada no encontrada para crear token', 'JwtAdapterService');
        throw new Error('Private key not found.');
      }

      this.logger.log(`Creando token para usuario: ${payload.email || payload.id}`, 'JwtAdapterService');

      const options: any = {
        algorithm: 'RS256',
        expiresIn: expiresIn
      };

      const accessToken = await Jwt.sign(payload, this.privateKey, options);

      this.logger.log('Token creado exitosamente', 'JwtAdapterService');

      const decodedToken = Jwt.decode(accessToken, { complete: true })?.payload as Jwt.JwtPayload;

      if (!decodedToken) {
        this.logger.error('Error al decodificar el token generado', 'JwtAdapterService');
        throw new Error('Failed to decode the generated token.');
      }

      // Validar que las fechas existan antes de crear los objetos Date
      if (!decodedToken.iat || !decodedToken.exp) {
        this.logger.error('Token decodificado no contiene fechas válidas (iat/exp)', 'JwtAdapterService');
        throw new Error('Decoded token does not contain valid timestamps.');
      }

      const createdAt = new Date(Number(decodedToken.iat) * 1000);
      const expiresAt = new Date(Number(decodedToken.exp) * 1000);

      this.logger.log(`Token creado - Expira: ${expiresAt.toISOString()}`, 'JwtAdapterService');

      return {
        accessToken,
        createdAt,
        expiresAt,
        expiresIn,
      };
    } catch (error) {
      this.logger.error(`Error al crear token: ${error.message}`, error.stack, 'JwtAdapterService');
      throw error;
    }
  }

  //Verificar si el token es valido
  async verifyToken(token: string): Promise<any> {
    try {
      this.logger.log('Verificando token', 'JwtAdapterService');
      
      const decoded = await Jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });
      
      this.logger.log('Token verificado exitosamente', 'JwtAdapterService');
      return decoded;
    } catch (error) {
      this.logger.error(`Error al verificar token: ${error.message}`, error.stack, 'JwtAdapterService');
      
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido');
      } else {
        throw new UnauthorizedException("Can't verify token. It is invalid or expired.");
      }
    }
  }

  //Decodificar el token para obtener el payload
  async decodeToken(token: string): Promise<any> {
    try {
      this.logger.log('Decodificando token', 'JwtAdapterService');
      
      const decoded = Jwt.decode(token);
      if (!decoded) {
        this.logger.error('La decodificación del token retornó null o undefined', 'JwtAdapterService');
        throw new Error('Token decoding returned null or undefined.');
      }
      
      this.logger.log('Token decodificado exitosamente', 'JwtAdapterService');
      return decoded;
    } catch (error) {
      this.logger.error(`Error al decodificar token: ${error.message}`, error.stack, 'JwtAdapterService');
      throw new UnauthorizedException('Cannot decode token. It is invalid or expired.');
    }
  }
}