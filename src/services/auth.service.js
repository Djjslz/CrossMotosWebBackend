import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

function generarToken(user) {
  return jwt.sign({ id: user._id, rol: user.rol }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export async function loginService({ usuario, password }) {
  const esEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario);
  const query = esEmail ? { email: usuario.toLowerCase() } : { nombre: { $regex: `^${usuario}$`, $options: 'i' } };
  const user = await User.findOne(query);
  if (!user || !user.activo) {
    throw ApiError.unauthorized('Credenciales inválidas');
  }
  const ok = await user.compararPassword(password);
  if (!ok) {
    throw ApiError.unauthorized('Credenciales inválidas');
  }
  const token = generarToken(user);
  return { usuario: user.toJSON(), token };
}

export async function datosPerfilService(user) {
  return user.toJSON();
}

export default { loginService, datosPerfilService };