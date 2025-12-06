import { z } from "zod";

export const PatchCategoryZ = z.object({
    active: z.boolean().optional(),
});

export type PatchCategoryInput = z.infer<typeof PatchCategoryZ>;