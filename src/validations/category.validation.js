import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido');

export const paginacionSchema = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
};

export const createCategorySchema = z.object({
  nombre: z.string({ message: 'El nombre es requerido' }).min(2, 'Mínimo 2 caracteres').max(80),
  descripcion: z.string().max(300).optional(),
  orden: z.coerce.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export default { createCategorySchema, updateCategorySchema, objectIdSchema, paginacionSchema };