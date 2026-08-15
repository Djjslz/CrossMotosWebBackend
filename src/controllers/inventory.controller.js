import { successResponse } from '../utils/ApiResponse.js';
import {
  listarInventarioService,
  listarAlertasService,
  ajustarInventarioService,
} from '../services/inventory.service.js';

export async function listarInventario(req, res, next) {
  try {
    const { data, pagination } = await listarInventarioService(req.query);
    res.json(successResponse('Inventario obtenido', data, pagination));
  } catch (err) {
    next(err);
  }
}

export async function listarAlertas(_req, res, next) {
  try {
    const data = await listarAlertasService();
    res.json(successResponse('Alertas de stock bajo', data));
  } catch (err) {
    next(err);
  }
}

export async function ajustarInventario(req, res, next) {
  try {
    const data = await ajustarInventarioService(req.params.id, req.body);
    res.json(successResponse('Inventario ajustado', data));
  } catch (err) {
    next(err);
  }
}

export default { listarInventario, listarAlertas, ajustarInventario };