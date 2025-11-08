import { z } from 'zod'

export const UserZ = z.object({
  id: z.string()
    .uuid()
    .optional(),

  name: z.string()
    .trim()
    .min(1, 'El nombre es requerido')
    .transform(val => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()),

  lastName: z.string()
    .trim()
    .min(1, 'EL apellido es obligatorio')
    .transform(val => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()),

  email: z.string()
    .email('Debe ingresar un correo válido')
    .toLowerCase(),

  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(64, 'La contraseña no debe superar los 64 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe tener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[@$!%*?&.,-_]/, 'Debe contener al menos un carácter especial (@$!%*?&.,-_)'),

  phone: z.string()
    .regex(/^\+56[0-9]{9}$/, "Teléfono inválido, use formato +569XXXXXXXX"),

  active: z.boolean()
    .default(true), // Valor por defecto si no lo envía

  roleCode: z.string()
    .min(1, 'El roleCode es requerido')
    .optional(), //lo definimos aquí como opcional
  rut: z
    .string()
    .regex(/^[0-9]+-[0-9kK]{1}$/, "RUT inválido")
});

// Esquema para crear usuarios (sin id, ya que se genera automáticamente)
export const CreateUserZ = UserZ.omit({ roleCode: true });

// Creación de usuario por admin (sí envía roleCode explícitamente)
export const AdminCreateUserZ = UserZ.extend({
  roleCode: z.string()
    .min(1, "El roleCode es obligatorio")
    .nonempty("El roleCode es obligatorio"),
});

// Esquema para la respuesta completa del usuario (con relaciones)
export const UserFullZ = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  active: z.boolean(),
  roleCode: z.string(),
  rut: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: z.object({
    id: z.string(),
    description: z.string(),
    code: z.string(),
    active: z.boolean(),
  }),
});

export type UserInput = z.infer<typeof CreateUserZ>
export type UserFull = z.infer<typeof UserFullZ>