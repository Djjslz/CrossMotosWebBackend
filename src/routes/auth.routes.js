import { Router } from 'express';
import { login, perfil } from '../controllers/auth.controller.js';
import { loginSchema } from '../validations/auth.validation.js';
import validate from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/perfil', authenticate, perfil);

export default router;