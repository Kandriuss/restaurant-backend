import { date, z } from 'zod';

export const MenuZ = z.object({
    id: z.string().uuid().optional(),
    plate: z.array(z.string().uuid()),
    date: z.date(),
    isCurrent: z.boolean().optional(),
});

export type MenuInput = z.infer<typeof MenuZ>;