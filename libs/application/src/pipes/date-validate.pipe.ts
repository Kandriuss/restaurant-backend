import { PipeTransform, BadRequestException } from '@nestjs/common';

export class ParseDatePipe implements PipeTransform {
  transform(value: string) {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(value)) {
      throw new BadRequestException(
        `Fecha inválida: ${value}. Debe ser (YYYY-MM-DD)`
      );
    }

    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    const isValid =
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day;

    if (!isValid) {
      throw new BadRequestException(
        `Fecha inválida: ${value}.`
      );
    }

    return parsed;
  }
}
