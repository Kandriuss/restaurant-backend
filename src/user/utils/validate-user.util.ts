import { CreateUserZ, UserInput } from '../domain';
import { BadRequestException } from '@nestjs/common';

export function validateUserInput(user: UserInput) {
  const result = CreateUserZ.safeParse(user);

  if (!result.success) {
    // Combina todos los mensajes de error en uno solo
    const messages = result.error.issues.map(i => i.message).join(', ');
    throw new BadRequestException(messages);
  }

  // Devuelve los datos validados y transformados
  return result.data;
}
