import { successResponse } from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import {
  listarInventarioService,
  listarAlertasService,
  ajustarInventarioService,
  exportarInventarioService,
  importarInventarioService,
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

export async function exportarInventario(_req, res, next) {
  try {
    const buffer = await exportarInventarioService();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="inventario_crossmotos.xlsx"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

export async function importarInventario(req, res, next) {
  try {
    if (!req.file?.buffer) throw ApiError.badRequest('Archivo no recibido');
    const data = await importarInventarioService(req.file.buffer);
    res.json(successResponse('Inventario importado correctamente', data));
  } catch (err) {
    next(err);
  }
}

export default {
  listarInventario,
  listarAlertas,
  ajustarInventario,
  exportarInventario,
  importarInventario,
};