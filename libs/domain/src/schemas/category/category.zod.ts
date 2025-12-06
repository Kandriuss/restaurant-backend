import z from "zod";

export const CategoryZ = z.object({
    id: z.string().uuid().optional(),
    description: z.string().trim().min(1, 'La descripción es requerida'),
    code: z.string().trim().min(1, 'El code es requerido'),
    active: z.boolean().optional(),
});

export type CategoryInput = z.infer<typeof CategoryZ>;