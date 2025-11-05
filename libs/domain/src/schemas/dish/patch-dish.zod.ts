import { z } from 'zod';

export const DishPatchZ = z.object({
    price: z.number().optional(),
    image: z.string().trim().optional(),
    active: z.boolean().optional(),
    description: z.string().trim().optional(),
});

export type PatchDishInput = z.infer<typeof DishPatchZ>;