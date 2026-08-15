import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.model.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Token no proporcionado'));
    }
    const token = header.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch {
      return next(ApiError.unauthorized('Token inválido o expirado'));
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.activo) {
      return next(ApiError.unauthorized('Usuario no encontrado o inactivo'));
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(ApiError.forbidden('No tienes permisos para esta acción'));
    }
    next();
  };
}

export default { authenticate, requireRole };