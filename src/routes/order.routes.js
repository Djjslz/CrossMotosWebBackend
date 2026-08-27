import { Router } from 'express';
import {
  crearPedido,
  listarPedidos,
  obtenerPedido,
  cambiarEstadoPedido,
  eliminarPedido,
} from '../controllers/order.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createOrderSchema,
  listarPedidosQuery,
  cambiarEstadoSchema,
} from '../validations/order.validation.js';

const router = Router();

router.post('/', validate(createOrderSchema), crearPedido);
router.get('/', authenticate, requireRole('admin', 'vendedor'), validate(listarPedidosQuery, 'query'), listarPedidos);
router.get('/:id', authenticate, requireRole('admin', 'vendedor'), obtenerPedido);
router.put('/:id/estado', authenticate, requireRole('admin', 'vendedor'), validate(cambiarEstadoSchema), cambiarEstadoPedido);
router.delete('/:id', authenticate, requireRole('admin'), eliminarPedido);

export default router;