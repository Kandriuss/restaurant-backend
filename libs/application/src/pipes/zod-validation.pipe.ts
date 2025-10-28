import { PipeTransform, ArgumentMetadata, BadRequestException, Injectable } from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}
  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      // parse devuelve el dato ya validado y tipado
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        // Estructura de error clara para el cliente
        throw new BadRequestException({
          message: 'Validation failed',
          errors: err.issues.map(e => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
        });
      }
      throw err;
    }
  }
}
