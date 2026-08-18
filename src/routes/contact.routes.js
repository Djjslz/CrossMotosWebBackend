import { Router } from 'express';
import {
  crearContacto,
  listarContactos,
  obtenerContacto,
  marcarLeido,
  eliminarContacto,
} from '../controllers/contact.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createContactSchema,
  listarContactosQuery,
  marcarLeidoSchema,
} from '../validations/contact.validation.js';

const router = Router();

router.post('/', validate(createContactSchema), crearContacto);

router.use(authenticate, requireRole('admin'));

router.get('/', validate(listarContactosQuery, 'query'), listarContactos);
router.get('/:id', obtenerContacto);
router.put('/:id/leido', validate(marcarLeidoSchema), marcarLeido);
router.delete('/:id', eliminarContacto);

export default router;