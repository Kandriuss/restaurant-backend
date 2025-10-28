import { z } from "zod";

export const LoginZ = z.object({
    email: z.string()
        .min(1, { message: "El correo electrónico es requerido" })
        .email({ message: "El formato del correo electrónico no es válido" }),
    password: z.string()
        .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
        .max(100, { message: "La contraseña no puede exceder 100 caracteres" }),
});

export type LoginInput = z.infer<typeof LoginZ>;