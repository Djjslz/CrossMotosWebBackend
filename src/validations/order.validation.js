import { z } from 'zod';
import { paginacionSchema } from './category.validation.js';

export const estadosPedido = ['recibido', 'cotizado', 'confirmado', 'entregado', 'cancelado'];

export const createOrderSchema = z.object({
  cliente: z.object({
    nombre: z.string({ message: 'El nombre es requerido' }).min(2, 'Mínimo 2 caracteres').max(80),
    telefono: z.string({ message: 'El teléfono es requerido' }).min(7, 'Teléfono inválido').max(20),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    ciudad: z.string().max(60).optional(),
    direccion: z.string().max(200).optional(),
    notas: z.string().max(500).optional(),
  }),
  items: z
    .array(
      z.object({
        codigo: z.string({ message: 'El código del producto es requerido' }).min(1).max(60),
        cantidad: z.coerce.number().int().min(1).max(9999),
      })
    )
    .min(1, 'El pedido debe tener al menos un producto'),
  tipoEntrega: z.enum(['recojo_en_tienda', 'envio']).default('recojo_en_tienda'),
  medioContacto: z.enum(['whatsapp', 'formulario']).default('formulario'),
  vendedor: z.string().max(80).optional(),
});

export const listarPedidosQuery = z.object({
  ...paginacionSchema,
  estado: z.enum(estadosPedido).optional(),
});

export const cambiarEstadoSchema = z.object({
  estado: z.enum(estadosPedido),
  vendedor: z.string().max(80).optional(),
});

export default { createOrderSchema, listarPedidosQuery, cambiarEstadoSchema, estadosPedido };