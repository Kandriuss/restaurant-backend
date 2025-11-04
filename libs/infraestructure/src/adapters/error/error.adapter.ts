import {
    InternalServerErrorException,
    NotFoundException,
    Logger,
  } from '@nestjs/common';
  
  /**
   * Adaptador reutilizable para manejo de errores de repositorios o servicios.
   * Se puede usar en cualquier servicio que interactúe con repositorios.
   */
  export class ErrorAdapter {
    private static readonly logger = new Logger('ErrorAdapter');
  
    static handle(error: any, action: string): never {
      if (error.message === 'DATABASE_ERROR') {
        this.logger.error(`Error de base de datos al ${action}`);
        throw new InternalServerErrorException('Error interno del servidor');
      }
  
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
  
      this.logger.error(`Error inesperado al ${action}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }
  