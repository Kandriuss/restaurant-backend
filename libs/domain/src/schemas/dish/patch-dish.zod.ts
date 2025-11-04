import { z } from 'zod';

export const DishPatchZ = z.object({
    price: z.number().min(0, 'El precio es requerido').optional(),
    image: z.string().trim().min(1, 'La imagen es requerida').optional(),
    active: z.boolean().optional(),
});

export type PatchDishInput = z.infer<typeof DishPatchZ>;