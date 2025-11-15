import { z } from "zod";

export const PatchMenuZ = z.object({
    plate: z.array(z.string().uuid()).optional(),
    date: z.coerce.date().optional(),
});

export type MenuPatchInput = z.infer<typeof PatchMenuZ>;