import { z } from 'zod';

export const loginSchema = z.object({
  usuario: z.string({ message: 'El usuario es requerido' }).min(2, 'Mínimo 2 caracteres').max(100),
  password: z.string({ message: 'La contraseña es requerida' }).min(6, 'Mínimo 6 caracteres'),
});

export const registroSchema = z.object({
  nombre: z.string({ message: 'El nombre es requerido' }).min(2, 'Mínimo 2 caracteres').max(100),
  email: z.string({ message: 'El email es requerido' }).email('Email inválido'),
  password: z.string({ message: 'La contraseña es requerida' }).min(6, 'Mínimo 6 caracteres').max(100),
});

export default { loginSchema, registroSchema };