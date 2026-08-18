import { z } from 'zod';
import { paginacionSchema } from './category.validation.js';

export const createContactSchema = z.object({
  nombre: z.string({ message: 'El nombre es requerido' }).min(2, 'Mínimo 2 caracteres').max(80),
  telefono: z.string({ message: 'El teléfono es requerido' }).min(7, 'Teléfono inválido').max(20),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  asunto: z.string().max(120).optional(),
  mensaje: z.string({ message: 'El mensaje es requerido' }).min(3, 'Mínimo 3 caracteres').max(1000),
  origen: z.enum(['whatsapp', 'formulario']).default('formulario'),
});

export const listarContactosQuery = z.object({
  ...paginacionSchema,
  leido: z.enum(['true', 'false']).optional(),
  busqueda: z.string().max(100).optional(),
});

export const marcarLeidoSchema = z.object({
  leido: z.boolean().default(true),
});

export default { createContactSchema, listarContactosQuery, marcarLeidoSchema };