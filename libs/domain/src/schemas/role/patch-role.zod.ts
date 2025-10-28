import { z } from 'zod';

export const PatchRoleZ = z.object({
    description: z.string().trim().min(1).optional(),
    active: z.boolean().optional(),
    code: z.string().trim().min(1).optional()
});

export type PatchRoleInput = z.infer<typeof PatchRoleZ>;