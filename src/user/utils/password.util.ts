import * as bcrypt from 'bcryptjs';
import { z } from 'zod';

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 10;

  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async validate(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
} 