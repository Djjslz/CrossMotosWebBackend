import { z } from 'zod';

export const createProductSchema = z.object({
  nombre: z.string({ message: 'El nombre es requerido' }).min(2, 'Mínimo 2 caracteres').max(200),
  codigo: z.string().max(60).optional(),
  descripcionCorta: z.string().max(200).optional(),
  descripcion: z.string().optional(),
  marca: z.string().max(80).optional(),
  categoria: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Categoría inválida'),
  precio: z.coerce.number().min(0, 'Precio no puede ser negativo'),
  precioAnterior: z.coerce.number().min(0).optional(),
  imagenes: z.array(z.string().max(500)).max(10).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  destacado: z.boolean().optional(),
  activo: z.boolean().optional(),
  caracteristicas: z
    .array(z.object({ clave: z.string().max(60), valor: z.string().max(200) }))
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const listarProductosQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  categoria: z.string().optional(),
  marca: z.string().optional(),
  busqueda: z.string().max(100).optional(),
  precioMin: z.coerce.number().min(0).optional(),
  precioMax: z.coerce.number().min(0).optional(),
  ordenar: z
    .enum(['precio', '-precio', 'nombre', '-nombre', 'createdAt', '-createdAt'])
    .default('-createdAt'),
});

export const ajusteInventarioSchema = z.object({
  ajuste: z.coerce.number().int().min(-999999).max(999999),
  stockMinimo: z.coerce.number().int().min(0).optional(),
  ubicacion: z.string().max(50).optional(),
});

export default {
  createProductSchema,
  updateProductSchema,
  listarProductosQuery,
  ajusteInventarioSchema,
};