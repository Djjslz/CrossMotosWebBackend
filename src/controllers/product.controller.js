import { successResponse } from '../utils/ApiResponse.js';
import {
  listarProductosService,
  listarDestacadosService,
  obtenerProductoService,
  crearProductoService,
  actualizarProductoService,
  desactivarProductoService,
} from '../services/product.service.js';

export async function listarProductos(req, res, next) {
  try {
    const { data, pagination } = await listarProductosService(req.query);
    res.json(successResponse('Productos obtenidos', data, pagination));
  } catch (err) {
    next(err);
  }
}

export async function listarDestacados(_req, res, next) {
  try {
    const data = await listarDestacadosService();
    res.json(successResponse('Productos destacados obtenidos', data));
  } catch (err) {
    next(err);
  }
}

export async function obtenerProducto(req, res, next) {
  try {
    const data = await obtenerProductoService(req.params.slug);
    res.json(successResponse('Producto obtenido', data));
  } catch (err) {
    next(err);
  }
}

export async function crearProducto(req, res, next) {
  try {
    const data = await crearProductoService(req.body);
    res.status(201).json(successResponse('Producto creado', data));
  } catch (err) {
    next(err);
  }
}

export async function actualizarProducto(req, res, next) {
  try {
    const data = await actualizarProductoService(req.params.id, req.body);
    res.json(successResponse('Producto actualizado', data));
  } catch (err) {
    next(err);
  }
}

export async function desactivarProducto(req, res, next) {
  try {
    const data = await desactivarProductoService(req.params.id);
    res.json(successResponse('Producto desactivado', data));
  } catch (err) {
    next(err);
  }
}

export default { listarProductos, listarDestacados, obtenerProducto, crearProducto, actualizarProducto, desactivarProducto };