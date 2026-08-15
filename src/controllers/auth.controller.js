import { successResponse } from '../utils/ApiResponse.js';
import { loginService, datosPerfilService } from '../services/auth.service.js';

export async function login(_req, res, next) {
  try {
    const data = await loginService(_req.body);
    res.status(200).json(successResponse('Sesión iniciada', data));
  } catch (err) {
    next(err);
  }
}

export async function perfil(req, res, next) {
  try {
    const data = await datosPerfilService(req.user);
    res.status(200).json(successResponse('Perfil obtenido', data));
  } catch (err) {
    next(err);
  }
}

export default { login, perfil };