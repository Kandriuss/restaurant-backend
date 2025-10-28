import { z } from 'zod';

export const RoleZ = z.object({
    id: z.string().uuid().optional(),
    description: z.string().trim().min(1, 'La descripción es requerida'),
    active: z.boolean().optional(),
    code: z.string().trim().min(1, 'El code es requerido')
});

export type RoleInput = z.infer<typeof RoleZ>;