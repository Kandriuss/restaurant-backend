import { z } from "zod"
import { UserZ } from "./user.zod";

// Patch exclusivo para cambio de contraseña
export const PatchPasswordZ = z.object({
  oldPassword: z.string().min(8, 'La contraseña actual es requerida'),
  newPassword: UserZ.shape.password,
  confirmPassword: z.string().min(1, 'La confirmación de contraseña es requerida')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

export type PatchPasswordInput = z.infer<typeof PatchPasswordZ> 