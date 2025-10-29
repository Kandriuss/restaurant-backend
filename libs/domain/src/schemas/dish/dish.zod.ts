import { z } from 'zod';

export const DishZ = z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, 'El nombre es requerido'),
    description: z.string().trim().min(1, 'La descripción es requerida'),
    price: z.number().min(0, 'El precio es requerido'),
    image: z.string().trim().min(1, 'La imagen es requerida'),
    active: z.boolean().optional(),
});

export type DishInput = z.infer<typeof DishZ>;