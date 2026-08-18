import { successResponse } from '../utils/ApiResponse.js';
import {
  crearContactoService,
  listarContactosService,
  obtenerContactoService,
  marcarLeidoService,
  eliminarContactoService,
} from '../services/contact.service.js';

export async function crearContacto(req, res, next) {
  try {
    const data = await crearContactoService(req.body);
    res.status(201).json(successResponse('Mensaje enviado', data));
  } catch (err) {
    next(err);
  }
}

export async function listarContactos(req, res, next) {
  try {
    const { data, pagination } = await listarContactosService(req.query);
    res.json(successResponse('Mensajes obtenidos', data, pagination));
  } catch (err) {
    next(err);
  }
}

export async function obtenerContacto(req, res, next) {
  try {
    const data = await obtenerContactoService(req.params.id);
    res.json(successResponse('Mensaje obtenido', data));
  } catch (err) {
    next(err);
  }
}

export async function marcarLeido(req, res, next) {
  try {
    const data = await marcarLeidoService(req.params.id, req.body.leido);
    res.json(successResponse('Mensaje actualizado', data));
  } catch (err) {
    next(err);
  }
}

export async function eliminarContacto(req, res, next) {
  try {
    const data = await eliminarContactoService(req.params.id);
    res.json(successResponse('Mensaje eliminado', data));
  } catch (err) {
    next(err);
  }
}

export default { crearContacto, listarContactos, obtenerContacto, marcarLeido, eliminarContacto };